"use client";

import { useState, useCallback, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUserAvatarGradient } from "@/lib/utils";
import { Home, MessageSquare, Settings, LogOut, ChevronLeft, ChevronRight, PawPrint, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile } from "@/contexts/profile-context";
import { useSocket } from "@/hooks/use-socket";

interface LobbyShellProps {
    user: {
        id: string;
        name: string;
        avatarUrl: string | null;
    };
    children: React.ReactNode;
}

const navItems = [
    { label: "Home", href: "/lobby", icon: Home },
    { label: "Messages", href: "/lobby/messages", icon: MessageSquare },
    { label: "Settings", href: "/lobby/settings", icon: Settings },
];

export default function LobbyShell({ user, children }: LobbyShellProps) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const { profile } = useProfile();

    // Use context profile (live updates) with server props as fallback
    const displayName = profile.name || user.name;
    const avatarUrl = profile.avatarUrl ?? user.avatarUrl;

    const initials = displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    // Listen for new messages via socket — increment unread when not on messages page
    useSocket({
        onConversationUpdated: useCallback(() => {
            setUnreadCount((c) => c + 1);
        }, []),
    });

    // Clear unread count when user navigates to messages
    useEffect(() => {
        if (pathname.startsWith("/lobby/messages")) {
            setUnreadCount(0);
        }
    }, [pathname]);

    return (
        <div className="flex h-screen bg-background relative overflow-hidden selection:bg-primary/20">
            {/* Ambient Background Blobs */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob pointer-events-none"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 pointer-events-none"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000 pointer-events-none"></div>

            <div className="flex w-full h-full relative z-10 p-2 md:p-4 gap-2 md:gap-4">
                {/* Sidebar - Now an animated glass panel */}
                <motion.aside
                    initial={false}
                    animate={{ width: sidebarOpen ? 256 : 88 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex flex-col rounded-[1.25rem] glass-card flex-shrink-0 shadow-xl relative overflow-hidden"
                >
                    {/* Inner subtle glow for the panel */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                    {/* Sidebar Header */}
                    <div className={`flex items-center border-b border-white/10 relative z-10 h-[72px] ${sidebarOpen ? "p-4" : "px-1.5 py-4 justify-between"}`}>
                        <Link href="/" className={`flex items-center gap-0 hover:opacity-80 transition-opacity overflow-hidden ${sidebarOpen ? "w-full" : "justify-center"}`}>
                            <div className="w-[36px] h-[36px] flex items-center justify-center flex-shrink-0">
                                <PawPrint className="w-6 h-6 text-primary drop-shadow-sm" />
                            </div>
                            <AnimatePresence>
                                {sidebarOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                                        animate={{ opacity: 1, width: "auto", marginLeft: 8 }}
                                        exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden whitespace-nowrap"
                                    >
                                        <span className="font-bold text-lg bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                                            WildChat
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className={`p-1.5 rounded-xl hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground backdrop-blur-sm flex-shrink-0 ${sidebarOpen ? "ml-auto absolute right-3" : ""}`}
                            aria-label="Toggle sidebar"
                        >
                            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3 space-y-2 relative z-10 overflow-y-auto overflow-x-hidden">
                        {navItems.map((item) => {
                            const isActive =
                                item.href === "/lobby"
                                    ? pathname === "/lobby"
                                    : pathname.startsWith(item.href);
                            const showBadge = item.href === "/lobby/messages" && unreadCount > 0;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 w-full relative ${
                                        isActive
                                            ? "bg-gradient-to-br from-primary/90 to-primary/70 text-primary-foreground shadow-[0_4px_20px_-4px_rgba(128,0,0,0.4)] translate-x-1"
                                            : "text-muted-foreground hover:bg-white/10 hover:text-foreground hover:translate-x-1"
                                    } ${!sidebarOpen && "justify-center px-0 translate-x-0 hover:translate-x-0"}`}
                                    title={!sidebarOpen ? item.label : undefined}
                                >
                                    <div className={`relative transition-transform duration-300 w-5 h-5 flex items-center justify-center flex-shrink-0 ${isActive ? "scale-110 drop-shadow-md" : ""}`}>
                                        <item.icon className="w-5 h-5" />
                                        {showBadge && !sidebarOpen && (
                                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm animate-in zoom-in duration-200">
                                                {unreadCount > 9 ? "9+" : unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <AnimatePresence>
                                        {sidebarOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                                                animate={{ opacity: 1, width: "auto", marginLeft: 12 }}
                                                exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="overflow-hidden whitespace-nowrap flex items-center gap-2"
                                            >
                                                <span className="drop-shadow-sm">
                                                    {item.label}
                                                </span>
                                                {showBadge && (
                                                    <span className="ml-auto px-1.5 py-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full min-w-[18px] text-center shadow-sm animate-in zoom-in duration-200">
                                                        {unreadCount > 99 ? "99+" : unreadCount}
                                                    </span>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Section */}
                    <div className="p-4 relative z-10 w-full mb-2">
                        <div className={`flex items-center rounded-2xl glass-card border border-white/10 dark:border-white/5 bg-white/5 p-2 shadow-lg ${!sidebarOpen ? "justify-center flex-col p-2" : ""}`}>
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={displayName}
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10 flex-shrink-0 z-10"
                                />
                            ) : (
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/10 flex-shrink-0 z-10 ${getUserAvatarGradient(displayName)}`}>
                                    {initials}
                                </div>
                            )}
                            
                            <AnimatePresence>
                                {sidebarOpen && (
                                    <motion.div
                                        key="expanded-profile"
                                        initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                                        animate={{ opacity: 1, width: "auto", marginLeft: 12 }}
                                        exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="flex-1 min-w-0 overflow-hidden"
                                    >
                                        <p className="text-sm font-semibold truncate drop-shadow-sm leading-tight text-foreground">{displayName}</p>
                                        <button
                                            onClick={() => signOut({ callbackUrl: "/" })}
                                            className="text-xs text-muted-foreground hover:text-destructive transition-colors font-medium mt-1 flex items-center gap-1.5 whitespace-nowrap group"
                                        >
                                            <LogOut className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                            Sign out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence>
                                {!sidebarOpen && (
                                    <motion.button
                                        key="collapsed-logout"
                                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                        animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        onClick={() => signOut({ callbackUrl: "/" })}
                                        className="p-1.5 rounded-xl bg-black/20 text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors flex-shrink-0 overflow-hidden"
                                        title="Sign out"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.aside>

                {/* Main content - Also glassmorphic slightly */}
                <main className="flex-1 overflow-auto rounded-[1.25rem] bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-2xl relative flex flex-col">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none rounded-[1.25rem]" />
                    {/* Top header bar */}
                    <div className="flex items-center justify-end px-4 py-2 border-b border-white/10 relative z-20 flex-shrink-0">
                        <Link
                            href="/lobby/messages"
                            className="relative p-2 rounded-xl hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
                            title="Messages"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-200 ring-2 ring-background">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </Link>
                    </div>
                    <div className="flex-1 relative z-10 overflow-y-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
