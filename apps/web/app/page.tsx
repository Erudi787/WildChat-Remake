import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import dynamic from "next/dynamic";

const LandingClient = dynamic(() => import("./landing-client"), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
    </div>
  ),
});

export default async function HomePage() {
  const session = await auth();

  let profileData: { avatarUrl: string | null; displayName: string } | null = null;
  let initialNotifications: {
    id: string;
    senderName: string;
    senderAvatar: string | null;
    content: string;
    conversationId: string;
    createdAt: string;
  }[] = [];

  if (session?.user?.id) {
    const userId = session.user.id;

    const [profile, recentUnread] = await Promise.all([
      prisma.userProfile.findUnique({
        where: { userId },
        select: { avatarUrl: true, displayName: true },
      }),
      prisma.conversationParticipant.findMany({
        where: { userId },
        include: {
          conversation: {
            include: {
              messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
                select: {
                  id: true,
                  content: true,
                  senderId: true,
                  createdAt: true,
                  sender: {
                    select: {
                      profile: {
                        select: { displayName: true, avatarUrl: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { conversation: { updatedAt: "desc" } },
      }),
    ]);

    profileData = profile;

    initialNotifications = recentUnread
      .filter((p) => {
        const lastMsg = p.conversation.messages[0];
        return lastMsg && lastMsg.id !== p.lastReadMessageId && lastMsg.senderId !== userId;
      })
      .map((p) => {
        const msg = p.conversation.messages[0]!;
        return {
          id: msg.id,
          senderName: msg.sender.profile?.displayName || "Unknown",
          senderAvatar: msg.sender.profile?.avatarUrl || null,
          content: msg.content,
          conversationId: p.conversationId,
          createdAt: msg.createdAt.toISOString(),
        };
      })
      .slice(0, 10);
  }

  return (
    <LandingClient
      session={session}
      profile={profileData}
      unreadCount={initialNotifications.length}
      initialNotifications={initialNotifications}
    />
  );
}
