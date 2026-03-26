import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/users/[id] — user detail
export async function GET(_req: Request, { params }: RouteParams) {
  const result = await requireAdmin();
  if (result instanceof NextResponse) return result;

  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            displayName: true,
            firstName: true,
            lastName: true,
            phone: true,
            bio: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            messages: true,
            conversations: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      messageCount: user._count.messages,
      conversationCount: user._count.conversations,
    });
  } catch (error) {
    console.error("Admin user detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[id] — approve, reject, suspend, reactivate, change role
export async function PATCH(req: Request, { params }: RouteParams) {
  const result = await requireAdmin({ adminOnly: true });
  if (result instanceof NextResponse) return result;
  const { session } = result;

  const { id } = await params;

  try {
    const body = await req.json();
    const { action, role: newRole } = body as {
      action?: "approve" | "reject" | "suspend" | "reactivate";
      role?: "USER" | "MODERATOR" | "ADMIN";
    };

    // Fetch the target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent modifying other ADMIN users (unless you're changing yourself)
    if (targetUser.role === "ADMIN" && targetUser.id !== session.user.id) {
      return NextResponse.json(
        { error: "Cannot modify another admin" },
        { status: 403 }
      );
    }

    // Prevent self-demotion
    if (newRole && targetUser.id === session.user.id && newRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Cannot demote yourself" },
        { status: 403 }
      );
    }

    const data: any = {};

    // Handle status actions
    if (action) {
      const statusMap: Record<string, string> = {
        approve: "ACTIVE",
        reject: "REJECTED",
        suspend: "SUSPENDED",
        reactivate: "ACTIVE",
      };

      if (!statusMap[action]) {
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
      }

      data.status = statusMap[action];
    }

    // Handle role change
    if (newRole) {
      if (!["USER", "MODERATOR", "ADMIN"].includes(newRole)) {
        return NextResponse.json(
          { error: "Invalid role" },
          { status: 400 }
        );
      }
      data.role = newRole;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No action or role specified" },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        role: true,
        status: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin user action error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] — delete user and all related data
export async function DELETE(_req: Request, { params }: RouteParams) {
  const result = await requireAdmin({ adminOnly: true });
  if (result instanceof NextResponse) return result;
  const { session } = result;

  const { id } = await params;

  try {
    // Prevent self-deletion
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 403 }
      );
    }

    // Prevent deleting other admins
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true, username: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.role === "ADMIN") {
      return NextResponse.json(
        { error: "Cannot delete an admin account" },
        { status: 403 }
      );
    }

    // Cascading delete: User model has onDelete: Cascade on profile,
    // accounts, sessions, conversations, and messages
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({
      deleted: true,
      username: targetUser.username,
    });
  } catch (error) {
    console.error("Admin user delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
