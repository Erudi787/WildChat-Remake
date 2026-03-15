import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import MessagesClientShell from "./messages-client-shell";

export const metadata = {
  title: "Messages - WildChat",
};

export default async function MessagesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth");
  }

  const userId = session.user.id;

  // Prefetch conversations server-side to eliminate client loading spinner
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

  const initialConversations = participations.map((p) => {
    const conv = p.conversation;
    const otherParticipant = conv.participants[0];
    const lastMessage = conv.messages[0] || null;

    return {
      id: conv.id,
      isGroup: conv.isGroup,
      updatedAt: conv.updatedAt.toISOString(),
      lastReadMessageId: p.lastReadMessageId,
      otherUser: otherParticipant
        ? {
            id: otherParticipant.user.id,
            username: otherParticipant.user.username,
            displayName:
              otherParticipant.user.profile?.displayName ||
              otherParticipant.user.username,
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

  return (
    <MessagesClientShell
      currentUserId={userId}
      initialConversations={initialConversations}
    />
  );
}
