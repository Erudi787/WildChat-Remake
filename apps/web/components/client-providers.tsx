"use client";

import { SessionProvider } from "next-auth/react";
import dynamic from "next/dynamic";

// Dynamically import SessionWatcher with ssr: false so useSession()
// doesn't break static page generation (404, _error, etc.)
const SessionWatcher = dynamic(
  () => import("@/components/auth/session-watcher"),
  { ssr: false }
);

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SessionWatcher />
      {children}
    </SessionProvider>
  );
}
