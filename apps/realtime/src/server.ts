import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import jwt from "jsonwebtoken";

const PORT = parseInt(process.env.PORT || "3001", 10);
const AUTH_SECRET = process.env.AUTH_SECRET || "";
const WEB_URL = process.env.WEB_URL || "http://localhost:3000";

if (!AUTH_SECRET) {
  console.error("❌ AUTH_SECRET environment variable is required");
  process.exit(1);
}

const app = express();
app.use(cors({ origin: WEB_URL }));

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: WEB_URL,
    methods: ["GET", "POST"],
  },
});

// ── Types ─────────────────────────────────────────────────

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

interface NewMessagePayload {
  id: string;
  conversationId: string;
  content: string;
  type: string;
  senderId: string;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

// ── Auth middleware ────────────────────────────────────────

io.use((socket: AuthenticatedSocket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Authentication token required"));
  }

  try {
    // Auth.js JWT tokens are encoded with the AUTH_SECRET
    const decoded = jwt.verify(token, AUTH_SECRET) as {
      id?: string;
      sub?: string;
      email?: string;
    };

    const userId = decoded.id || decoded.sub;
    if (!userId) {
      return next(new Error("Invalid token: no user ID"));
    }

    socket.userId = userId;
    next();
  } catch (err) {
    console.error("Socket auth failed:", err);
    return next(new Error("Invalid token"));
  }
});

// ── Connection handler ────────────────────────────────────

io.on("connection", (socket: AuthenticatedSocket) => {
  const userId = socket.userId!;
  console.log(`✅ User connected: ${userId} (socket: ${socket.id})`);

  // Join a personal room for direct notifications
  socket.join(`user:${userId}`);

  // Join conversation rooms
  socket.on("join:conversation", (conversationId: string) => {
    socket.join(`conv:${conversationId}`);
    console.log(`👤 ${userId} joined conv:${conversationId}`);
  });

  socket.on("leave:conversation", (conversationId: string) => {
    socket.leave(`conv:${conversationId}`);
    console.log(`👤 ${userId} left conv:${conversationId}`);
  });

  // Typing indicators
  socket.on(
    "typing:start",
    (data: { conversationId: string; displayName: string }) => {
      socket.to(`conv:${data.conversationId}`).emit("typing:start", {
        userId,
        displayName: data.displayName,
        conversationId: data.conversationId,
      });
    }
  );

  socket.on("typing:stop", (data: { conversationId: string }) => {
    socket.to(`conv:${data.conversationId}`).emit("typing:stop", {
      userId,
      conversationId: data.conversationId,
    });
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${userId}`);
  });
});

// ── Internal API for the Next.js app to broadcast events ──

app.use(express.json());

// POST /emit/message — called by the Next.js API when a message is sent
app.post("/emit/message", (req, res) => {
  const apiKey = req.headers["x-api-key"];
  const expectedKey = process.env.INTERNAL_API_KEY || "wildchat-internal-key";

  if (apiKey !== expectedKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const message: NewMessagePayload = req.body.message;
  const participantUserIds: string[] = req.body.participantUserIds;

  if (!message || !participantUserIds) {
    return res.status(400).json({ error: "Missing message or participantUserIds" });
  }

  // Broadcast to the conversation room
  io.to(`conv:${message.conversationId}`).emit("message:new", message);

  // Also notify each participant's personal room (for inbox updates)
  participantUserIds.forEach((uid) => {
    io.to(`user:${uid}`).emit("conversation:updated", {
      conversationId: message.conversationId,
      lastMessage: message,
    });
  });

  console.log(
    `📨 Broadcast message ${message.id} to conv:${message.conversationId}`
  );
  res.json({ success: true });
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", connections: io.engine.clientsCount });
});

// ── Start server ──────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`🚀 WildChat Realtime server running on port ${PORT}`);
  console.log(`   Accepts connections from: ${WEB_URL}`);
});
