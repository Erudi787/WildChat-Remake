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

  // Fetch the user's actual profile avatar and unread count if authenticated
  let profileData: { avatarUrl: string | null; displayName: string } | null = null;
  let unreadCount = 0;
  if (session?.user?.id) {
    const [profile, unreadMessages] = await Promise.all([
      prisma.userProfile.findUnique({
        where: { userId: session.user.id },
        select: { avatarUrl: true, displayName: true },
      }),
      // Count conversations with unread messages
      prisma.conversationParticipant.findMany({
        where: { userId: session.user.id },
        select: {
          lastReadMessageId: true,
          conversation: {
            select: {
              messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
                select: { id: true },
              },
            },
          },
        },
      }),
    ]);
    profileData = profile;
    // Count conversations where lastMessage.id !== lastReadMessageId
    unreadCount = unreadMessages.filter((p) => {
      const lastMsg = p.conversation.messages[0];
      return lastMsg && lastMsg.id !== p.lastReadMessageId;
    }).length;
  }

  return <LandingClient session={session} profile={profileData} unreadCount={unreadCount} />;
}
