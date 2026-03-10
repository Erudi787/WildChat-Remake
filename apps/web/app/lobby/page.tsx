import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LobbyHomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const userId = session.user.id;

  // Fetch user profile
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  // Fetch recent conversations with latest message
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
                  username: true,
                  profile: {
                    select: { displayName: true, avatarUrl: true },
                  },
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              content: true,
              senderId: true,
              createdAt: true,
            },
          },
          _count: { select: { messages: true } },
        },
      },
    },
    orderBy: { conversation: { updatedAt: "desc" } },
    take: 5,
  });

  const totalConversations = await prisma.conversationParticipant.count({
    where: { userId },
  });

  const totalMessages = await prisma.message.count({
    where: { senderId: userId },
  });

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {profile?.displayName || "Wildcat"} 🐾
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening on campus.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-2xl font-bold">{totalConversations}</p>
          <p className="text-xs text-muted-foreground">Conversations</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-2xl font-bold">{totalMessages}</p>
          <p className="text-xs text-muted-foreground">Messages Sent</p>
        </div>
        <div className="rounded-lg border bg-card p-4 col-span-2 md:col-span-1">
          <p className="text-2xl font-bold">
            {profile?.bio ? "✅" : "📝"}
          </p>
          <p className="text-xs text-muted-foreground">
            {profile?.bio ? "Profile Complete" : "Add a bio in Settings"}
          </p>
        </div>
      </div>

      {/* Recent conversations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Chats</h2>
          <Link
            href="/lobby/messages"
            className="text-xs text-primary hover:underline"
          >
            View all →
          </Link>
        </div>

        {participations.length === 0 ? (
          <div className="rounded-lg border bg-card p-6 text-center">
            <div className="text-3xl mb-2">💬</div>
            <p className="text-sm text-muted-foreground">
              No conversations yet.{" "}
              <Link
                href="/lobby/messages"
                className="text-primary hover:underline"
              >
                Start one!
              </Link>
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {participations.map((p) => {
              const conv = p.conversation;
              const other = conv.participants[0]?.user;
              const lastMsg = conv.messages[0];
              const displayName =
                other?.profile?.displayName || other?.username || "Unknown";

              return (
                <Link
                  key={conv.id}
                  href="/lobby/messages"
                  className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:bg-muted/50 transition-colors"
                >
                  {other?.profile?.avatarUrl ? (
                    <img
                      src={other.profile.avatarUrl}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full gradient-maroon-gold flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {displayName[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {displayName}
                    </p>
                    {lastMsg ? (
                      <p className="text-xs text-muted-foreground truncate">
                        {lastMsg.senderId === userId ? "You: " : ""}
                        {lastMsg.content}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        No messages yet
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {conv._count.messages} msgs
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/lobby/messages"
          className="rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors text-center"
        >
          <div className="text-2xl mb-1">💬</div>
          <p className="text-sm font-medium">Messages</p>
        </Link>
        <Link
          href="/lobby/settings"
          className="rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors text-center"
        >
          <div className="text-2xl mb-1">⚙️</div>
          <p className="text-sm font-medium">Settings</p>
        </Link>
      </div>
    </div>
  );
}
