import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/session-provider";

import SessionWatcher from "@/components/auth/session-watcher";

export const metadata: Metadata = {
  title: "WildChat – Love Purrs Around Campus",
  description:
    "Campus-based real-time chat application for CIT-U Wildcats. Connect, chat, and share with your campus community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <SessionProvider>
          <SessionWatcher />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
