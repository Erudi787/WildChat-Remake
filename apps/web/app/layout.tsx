import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WildChat – Love Purrs Around Campus",
  description: "Campus-based real-time chat application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
