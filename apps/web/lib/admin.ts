import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Verify the current session has admin (or moderator) privileges.
 * Returns the session on success, or a 401/403 NextResponse on failure.
 *
 * Usage:
 *   const result = await requireAdmin();
 *   if (result instanceof NextResponse) return result;
 *   const { session } = result;
 */
export async function requireAdmin(opts?: { adminOnly?: boolean }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role as string | undefined;
  const allowedRoles = opts?.adminOnly
    ? ["ADMIN"]
    : ["ADMIN", "MODERATOR"];

  if (!role || !allowedRoles.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return { session };
}
