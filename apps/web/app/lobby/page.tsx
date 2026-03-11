import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserAvatarGradient } from "@/lib/utils";

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
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
        <h1 className="text-3xl font-bold">
          Welcome back, {profile?.displayName || "Wildcat"} 🐾
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening on campus.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
        <div className="glass-card rounded-[1.25rem] p-5 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
          <p className="text-3xl font-bold relative z-10 bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent drop-shadow-sm">{totalConversations}</p>
          <p className="text-sm font-medium text-muted-foreground relative z-10 mt-1">Conversations</p>
        </div>
        <div className="glass-card rounded-[1.25rem] p-5 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-colors" />
          <p className="text-3xl font-bold relative z-10 bg-gradient-to-br from-secondary to-accent bg-clip-text text-transparent drop-shadow-sm">{totalMessages}</p>
          <p className="text-sm font-medium text-muted-foreground relative z-10 mt-1">Messages Sent</p>
        </div>
        <div className="glass-card rounded-[1.25rem] p-5 col-span-2 md:col-span-1 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-colors" />
          <p className="text-3xl font-bold relative z-10 drop-shadow-sm">
            {profile?.bio ? "✅" : "📝"}
          </p>
          <p className="text-sm font-medium text-muted-foreground relative z-10 mt-1">
            {profile?.bio ? "Profile Complete" : "Add a bio in Settings"}
          </p>
        </div>
      </div>

      {/* Recent conversations */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
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
          <div className="glass-card rounded-[1.25rem] p-8 text-center shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 shadow-inner ring-4 ring-primary/5">
              <span className="text-3xl drop-shadow-sm">💬</span>
            </div>
            <p className="text-base font-semibold text-foreground mb-1 relative z-10">
              Your inbox is quiet right now.
            </p>
            <p className="text-sm text-muted-foreground mb-6 relative z-10">
              Jump into the global directory and start chatting.
            </p>
            <Link
              href="/lobby/messages"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-2 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-primary/30 relative z-10"
            >
              Start a Conversation
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
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
                  className="flex items-center gap-4 rounded-[1.25rem] glass-panel p-4 hover:bg-white/60 dark:hover:bg-black/60 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 group"
                >
                  {other?.profile?.avatarUrl ? (
                    <img
                      src={other.profile.avatarUrl}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-white/20 shadow-sm group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0 shadow-sm ring-2 ring-white/20 group-hover:scale-105 transition-transform ${getUserAvatarGradient(other?.username || "?")}`}>
                      {displayName[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold truncate group-hover:text-primary transition-colors">
                      {displayName}
                    </p>
                    {lastMsg ? (
                      <p className="text-sm text-muted-foreground truncate opacity-90">
                        <span className="font-medium opacity-70">{lastMsg.senderId === userId ? "You: " : ""}</span>
                        {lastMsg.content}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic opacity-70">
                        No messages yet
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">
                      {conv._count.messages} msgs
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
        <Link
          href="/lobby/messages"
          className="glass-card rounded-[1.25rem] p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-3xl mb-2 group-hover:scale-110 group-hover:-rotate-6 transition-transform drop-shadow-md relative z-10">💬</div>
          <p className="text-sm font-bold relative z-10">Messages directly</p>
        </Link>
        <Link
          href="/lobby/settings"
          className="glass-card rounded-[1.25rem] p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-3xl mb-2 group-hover:scale-110 group-hover:rotate-6 transition-transform drop-shadow-md relative z-10">⚙️</div>
          <p className="text-sm font-bold relative z-10">Account Settings</p>
        </Link>
      </div>
    </div>
  );
}
