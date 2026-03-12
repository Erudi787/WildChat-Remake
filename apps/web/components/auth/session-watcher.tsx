"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function SessionWatcher() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      // the session doesn't exist or expired
      // the lobby layouts already redirect inside Server Components layout.tsx
      // but this acts as an active client-side watcher.
    } else if ((session as any)?.error === "RefreshAccessTokenError") {
      // Force sign out if refresh fails
      signOut({ callbackUrl: "/auth?expired=true" });
    }
  }, [session, status]);

  return null; // This component doesn't render anything
}
