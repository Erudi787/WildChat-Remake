import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const result = await requireAdmin();
  if (result instanceof NextResponse) return result;

  try {
    const [
      totalUsers,
      pendingUsers,
      activeUsers,
      suspendedUsers,
      rejectedUsers,
      totalMessages,
      totalConversations,
      recentRegistrations,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "PENDING" } }),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { status: "SUSPENDED" } }),
      prisma.user.count({ where: { status: "REJECTED" } }),
      prisma.message.count(),
      prisma.conversation.count(),
      // Registrations in the last 7 days
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      pendingUsers,
      activeUsers,
      suspendedUsers,
      rejectedUsers,
      totalMessages,
      totalConversations,
      recentRegistrations,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
