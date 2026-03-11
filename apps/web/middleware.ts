import { auth } from "@/auth";
import { NextResponse } from "next/server";

const publicPaths = ["/auth", "/api/auth"];

export default auth((req) => {
    const { pathname } = req.nextUrl;

    // Allow public paths
    const isPublic = publicPaths.some(
        (p) => pathname.startsWith(p) || pathname === "/"
    );
    if (isPublic) return NextResponse.next();

    // Allow API routes that aren't explicitly protected
    if (pathname.startsWith("/api/") && !pathname.startsWith("/api/user")) {
        return NextResponse.next();
    }

    // Redirect unauthenticated users to login
    if (!req.auth) {
        const loginUrl = new URL("/auth", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
