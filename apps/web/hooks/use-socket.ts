"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

const REALTIME_URL = process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3001";

interface UseSocketOptions {
  conversationId?: string;
  onNewMessage?: (message: SocketMessage) => void;
  onConversationUpdated?: (data: ConversationUpdate) => void;
  onTypingStart?: (data: TypingEvent) => void;
  onTypingStop?: (data: TypingEvent) => void;
}

export interface SocketMessage {
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

interface ConversationUpdate {
  conversationId: string;
  lastMessage: SocketMessage;
}

interface TypingEvent {
  userId: string;
  displayName: string;
  conversationId: string;
}

export function useSocket({
  conversationId,
  onNewMessage,
  onConversationUpdated,
  onTypingStart,
  onTypingStop,
}: UseSocketOptions) {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  // Get JWT token from the session cookie
  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      // For Socket.IO auth, we pass the raw session token
      // The session cookie name in Auth.js is typically in the cookies
      // Instead, we'll create a lightweight token endpoint
      if (data && session?.user?.id) {
        return session.user.id; // Fallback: we use internal API key approach
      }
      return null;
    } catch {
      return null;
    }
  }, [session]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const socket = io(REALTIME_URL, {
      auth: { token: session.user.id },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Connected to realtime server");
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("🔌 Disconnected from realtime server");
      setConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.warn("⚠️ Realtime connection error:", err.message);
      setConnected(false);
    });

    // Listen for new messages
    socket.on("message:new", (message: SocketMessage) => {
      onNewMessage?.(message);
    });

    // Listen for conversation updates (inbox refresh)
    socket.on("conversation:updated", (data: ConversationUpdate) => {
      onConversationUpdated?.(data);
    });

    // Typing indicators
    socket.on("typing:start", (data: TypingEvent) => {
      onTypingStart?.(data);
    });

    socket.on("typing:stop", (data: TypingEvent) => {
      onTypingStop?.(data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  // Join/leave conversation room
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !connected || !conversationId) return;

    socket.emit("join:conversation", conversationId);
    return () => {
      socket.emit("leave:conversation", conversationId);
    };
  }, [conversationId, connected]);

  const emitTypingStart = useCallback(
    (displayName: string) => {
      if (socketRef.current && conversationId) {
        socketRef.current.emit("typing:start", {
          conversationId,
          displayName,
        });
      }
    },
    [conversationId]
  );

  const emitTypingStop = useCallback(() => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit("typing:stop", { conversationId });
    }
  }, [conversationId]);

  return {
    connected,
    emitTypingStart,
    emitTypingStop,
  };
}
