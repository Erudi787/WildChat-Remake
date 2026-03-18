import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "@/components/client-providers";

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
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
