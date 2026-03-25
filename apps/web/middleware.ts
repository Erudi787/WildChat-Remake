import { auth } from "@/auth";
import { NextResponse } from "next/server";

const publicPaths = ["/auth", "/api/auth", "/pending"];

export default auth((req) => {
    const { pathname } = req.nextUrl;

    // Allow public paths and home
    const isPublic = publicPaths.some(
        (p) => pathname.startsWith(p) || pathname === "/"
    );
    if (isPublic) return NextResponse.next();

    // Allow non-protected API routes (except /api/user and /api/admin)
    if (
        pathname.startsWith("/api/") &&
        !pathname.startsWith("/api/user") &&
        !pathname.startsWith("/api/admin")
    ) {
        return NextResponse.next();
    }

    // Redirect unauthenticated users to login
    if (!req.auth) {
        const loginUrl = new URL("/auth", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    const user = req.auth.user as any;

    // Admin routes: only ADMIN (and MODERATOR for read access) can enter
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
        const role = user?.role;
        if (role !== "ADMIN" && role !== "MODERATOR") {
            if (pathname.startsWith("/api/")) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
            return NextResponse.redirect(new URL("/lobby", req.url));
        }
    }

    // Lobby routes: only ACTIVE users (or ADMIN) can access
    if (pathname.startsWith("/lobby")) {
        const status = user?.status;
        const role = user?.role;
        if (role !== "ADMIN" && status !== "ACTIVE") {
            return NextResponse.redirect(new URL("/pending", req.url));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
