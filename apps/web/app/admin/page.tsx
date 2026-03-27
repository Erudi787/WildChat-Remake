import { prisma } from "@/lib/db";
import AdminDashboard from "./components/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [
    totalUsers,
    pendingUsers,
    activeUsers,
    suspendedUsers,
    totalMessages,
    totalConversations,
    recentRegistrations,
    pendingList,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { status: "SUSPENDED" } }),
    prisma.message.count(),
    prisma.conversation.count(),
    prisma.user.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.user.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        profile: {
          select: { displayName: true, avatarUrl: true },
        },
      },
    }),
  ]);

  return (
    <AdminDashboard
      stats={{
        totalUsers,
        pendingUsers,
        activeUsers,
        suspendedUsers,
        totalMessages,
        totalConversations,
        recentRegistrations,
      }}
      pendingList={pendingList.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        displayName: u.profile?.displayName || u.username,
        avatarUrl: u.profile?.avatarUrl || null,
        createdAt: u.createdAt.toISOString(),
      }))}
    />
  );
}
