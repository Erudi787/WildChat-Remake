"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  Shield,
  ArrowLeft,
} from "lucide-react";

interface AdminShellProps {
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    role: string;
  };
  pendingCount: number;
  children: React.ReactNode;
}

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Users", badgeKey: "pending" as const },
];

export default function AdminShell({ user, pendingCount, children }: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Ambient blobs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/15 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-72 h-72 bg-secondary/15 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-accent/15 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000 pointer-events-none" />

      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 88 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative z-20 flex flex-col h-full p-4 glass-card rounded-r-[1.25rem] border-l-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-2 overflow-hidden"
              >
                <Shield className="w-7 h-7 text-primary shrink-0" />
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap">
                  Admin Panel
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
          >
            {collapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const badge = item.badgeKey === "pending" ? pendingCount : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  active
                    ? "bg-gradient-to-r from-primary/90 to-primary/70 text-primary-foreground shadow-[0_4px_20px_-4px] shadow-primary/30"
                    : "text-muted-foreground hover:bg-white/10 hover:text-foreground hover:translate-x-1"
                }`}
              >
                <div className="relative shrink-0">
                  <item.icon className={`w-5 h-5 ${active ? "drop-shadow-md" : ""}`} />
                  {badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-background">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="space-y-2 pt-4 border-t border-white/10">
          <Link
            href="/lobby"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all duration-300 hover:translate-x-1"
          >
            <ArrowLeft className="w-5 h-5 shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-medium whitespace-nowrap overflow-hidden"
                >
                  Back to Chat
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* User info */}
          <div className="glass-card rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0 ring-2 ring-white/10 overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex-1 min-w-0 overflow-hidden"
                  >
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-xs text-primary font-medium">{user.role}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2 rounded-lg text-muted-foreground hover:text-destructive transition-colors shrink-0"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
