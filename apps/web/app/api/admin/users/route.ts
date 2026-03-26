import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

// GET /api/admin/users — list users with search, filter, pagination
export async function GET(req: Request) {
  const result = await requireAdmin();
  if (result instanceof NextResponse) return result;

  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const role = url.searchParams.get("role") || "";
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
    const sort = url.searchParams.get("sort") || "createdAt";
    const order = url.searchParams.get("order") === "asc" ? "asc" : "desc";

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { profile: { displayName: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status && ["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"].includes(status)) {
      where.status = status;
    }

    if (role && ["USER", "MODERATOR", "ADMIN"].includes(role)) {
      where.role = role;
    }

    // Build orderBy
    const orderBy: any = {};
    if (sort === "username") orderBy.username = order;
    else if (sort === "email") orderBy.email = order;
    else if (sort === "role") orderBy.role = order;
    else if (sort === "status") orderBy.status = order;
    else orderBy.createdAt = order;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          profile: {
            select: {
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt.toISOString(),
        displayName: u.profile?.displayName || u.username,
        avatarUrl: u.profile?.avatarUrl || null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Admin users list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users — bulk actions (approve, reject, suspend)
export async function PATCH(req: Request) {
  const result = await requireAdmin({ adminOnly: true });
  if (result instanceof NextResponse) return result;

  try {
    const body = await req.json();
    const { userIds, action } = body as {
      userIds: string[];
      action: "approve" | "reject" | "suspend" | "reactivate";
    };

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "userIds must be a non-empty array" },
        { status: 400 }
      );
    }

    if (!["approve", "reject", "suspend", "reactivate"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be: approve, reject, suspend, reactivate" },
        { status: 400 }
      );
    }

    const statusMap: Record<string, string> = {
      approve: "ACTIVE",
      reject: "REJECTED",
      suspend: "SUSPENDED",
      reactivate: "ACTIVE",
    };

    // Don't allow bulk actions on ADMIN users
    const updated = await prisma.user.updateMany({
      where: {
        id: { in: userIds },
        role: { not: "ADMIN" },
      },
      data: {
        status: statusMap[action] as any,
      },
    });

    return NextResponse.json({
      updated: updated.count,
      action,
    });
  } catch (error) {
    console.error("Admin bulk action error:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk action" },
      { status: 500 }
    );
  }
}
