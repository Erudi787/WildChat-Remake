import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { CreateConversationRequestSchema } from "@wildchat/types";

// GET /api/conversations — list all conversations for current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch conversations the user participates in
    const participations = await prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
              where: { userId: { not: userId } },
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    profile: {
                      select: {
                        displayName: true,
                        avatarUrl: true,
                      },
                    },
                  },
                },
              },
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                id: true,
                content: true,
                senderId: true,
                createdAt: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: {
        conversation: { updatedAt: "desc" },
      },
    });

    const conversations = participations.map((p) => {
      const conv = p.conversation;
      const otherParticipant = conv.participants[0];
      const lastMessage = conv.messages[0] || null;

      // Count unread: messages after lastReadMessageId
      return {
        id: conv.id,
        isGroup: conv.isGroup,
        updatedAt: conv.updatedAt.toISOString(),
        lastReadMessageId: p.lastReadMessageId,
        otherUser: otherParticipant
          ? {
              id: otherParticipant.user.id,
              username: otherParticipant.user.username,
              displayName: otherParticipant.user.profile?.displayName || otherParticipant.user.username,
              avatarUrl: otherParticipant.user.profile?.avatarUrl || null,
            }
          : null,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              senderId: lastMessage.senderId,
              createdAt: lastMessage.createdAt.toISOString(),
              type: lastMessage.type,
            }
          : null,
      };
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Conversation list error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// POST /api/conversations — create or find a 1:1 conversation
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CreateConversationRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { participantId } = parsed.data;
    const userId = session.user.id;

    if (participantId === userId) {
      return NextResponse.json(
        { error: "Cannot create a conversation with yourself" },
        { status: 400 }
      );
    }

    // Check if participant exists
    const participant = await prisma.user.findUnique({
      where: { id: participantId },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if a 1:1 conversation already exists between these two users
    const existing = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: participantId } } },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ conversationId: existing.id }, { status: 200 });
    }

    // Create a new 1:1 conversation
    const conversation = await prisma.conversation.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { userId },
            { userId: participantId },
          ],
        },
      },
    });

    return NextResponse.json(
      { conversationId: conversation.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
