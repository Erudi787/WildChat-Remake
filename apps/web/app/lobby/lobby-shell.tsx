"use client";

import { useState, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getUserAvatarGradient } from "@/lib/utils";
import { Home, MessageSquare, Settings, LogOut, ChevronLeft, ChevronRight, PawPrint, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile } from "@/contexts/profile-context";
import { useSocket, SocketMessage } from "@/hooks/use-socket";

interface LobbyShellProps {
    user: {
        id: string;
        name: string;
        avatarUrl: string | null;
    };
    initialNotifications?: NotificationItem[];
    children: React.ReactNode;
}

const navItems = [
    { label: "Home", href: "/lobby", icon: Home },
    { label: "Messages", href: "/lobby/messages", icon: MessageSquare },
    { label: "Settings", href: "/lobby/settings", icon: Settings },
];

interface NotificationItem {
    id: string;
    senderName: string;
    senderAvatar: string | null;
    content: string;
    conversationId: string;
    createdAt: string;
}

/** Portal-rendered dropdown — avoids all stacking context / overflow clipping issues */
function NotificationDropdown({
    bellRef,
    notifications,
    unreadCount,
    onClose,
    onNavigate,
    formatRelativeTime,
}: {
    bellRef: React.RefObject<HTMLElement | null>;
    notifications: NotificationItem[];
    unreadCount: number;
    onClose: () => void;
    onNavigate: (path: string) => void;
    formatRelativeTime: (d: string) => string;
}) {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState<{ top: number; right: number } | null>(null);

    // Position dropdown below the bell button — useLayoutEffect to avoid flash
    useLayoutEffect(() => {
        if (bellRef.current) {
            const rect = bellRef.current.getBoundingClientRect();
            setPos({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right,
            });
        }
    }, [bellRef]);

    // Close on click outside
    useEffect(() => {
        const handle = (e: MouseEvent) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
                bellRef.current && !bellRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, [onClose, bellRef]);

    if (!pos) return null;

    return (
        <div
            ref={dropdownRef}
            className="fixed w-80 rounded-2xl border border-white/20 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden z-[9999] animate-in fade-in duration-150"
            style={{ top: pos.top, right: pos.right }}
        >
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                    <span className="text-xs text-primary font-medium">{unreadCount} new</span>
                )}
            </div>
            <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                        <Bell className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                        <p className="text-sm text-muted-foreground">No notifications yet</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Messages will appear here</p>
                    </div>
                ) : (
                    notifications.map((n) => (
                        <button
                            key={n.id}
                            onClick={() => onNavigate(`/lobby/messages?chat=${n.conversationId}`)}
                            className="w-full px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b border-white/5 last:border-b-0"
                        >
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2 min-w-0">
                                    {n.senderAvatar ? (
                                        <img src={n.senderAvatar} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                                    ) : (
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 ${getUserAvatarGradient(n.senderName)}`}>
                                            {n.senderName[0]?.toUpperCase()}
                                        </div>
                                    )}
                                    <p className="text-xs font-bold text-foreground/70 truncate">
                                        Message from {n.senderName}
                                    </p>
                                </div>
                                <span className="text-[10px] text-muted-foreground/60 flex-shrink-0 ml-2">
                                    {formatRelativeTime(n.createdAt)}
                                </span>
                            </div>
                            <p className="text-sm text-foreground line-clamp-2 leading-snug">
                                {n.content}
                            </p>
                        </button>
                    ))
                )}
            </div>
            <div className="px-4 py-2.5 border-t border-white/10">
                <button
                    onClick={() => onNavigate("/lobby/messages")}
                    className="text-xs text-primary font-semibold hover:underline"
                >
                    View all messages →
                </button>
            </div>
        </div>
    );
}

export default function LobbyShell({ user, initialNotifications = [], children }: LobbyShellProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [unreadCount, setUnreadCount] = useState(initialNotifications.length);
    const [bellOpen, setBellOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
    const bellRef = useRef<HTMLButtonElement>(null);
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

    // Listen for new messages via socket — update notifications + refresh server data
    useSocket({
        onConversationUpdated: useCallback((data: { conversationId: string; lastMessage: SocketMessage }) => {
            // Don't notify for own messages
            if (data.lastMessage.senderId === user.id) return;
            setUnreadCount((c) => c + 1);
            setNotifications((prev) => {
                const item: NotificationItem = {
                    id: data.lastMessage.id,
                    senderName: data.lastMessage.sender.displayName,
                    senderAvatar: data.lastMessage.sender.avatarUrl,
                    content: data.lastMessage.content,
                    conversationId: data.conversationId,
                    createdAt: data.lastMessage.createdAt,
                };
                const filtered = prev.filter((n) => n.id !== item.id);
                return [item, ...filtered].slice(0, 10);
            });
            // Re-fetch server component data so lobby page updates in realtime
            router.refresh();
        }, [user.id, router]),
    });

    // Clear unread count when user navigates to messages
    useEffect(() => {
        if (pathname.startsWith("/lobby/messages")) {
            setUnreadCount(0);
        }
    }, [pathname]);

    function formatRelativeTime(dateStr: string) {
        const diffMs = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 1) return "now";
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h`;
        return `${Math.floor(hrs / 24)}d`;
    }

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
                <main className="flex-1 rounded-[1.25rem] bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-2xl relative flex flex-col overflow-visible">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none rounded-[1.25rem]" />
                    {/* Top header bar */}
                    <div className="flex items-center justify-end px-4 py-2 border-b border-white/10 relative z-30 flex-shrink-0">
                        <button
                            ref={bellRef}
                            onClick={(e) => { e.stopPropagation(); setBellOpen((o) => !o); }}
                            className="relative p-2 rounded-xl hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
                            title="Notifications"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-200 ring-2 ring-background">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notification dropdown — rendered via portal to avoid overflow clipping */}
                        {bellOpen && typeof document !== "undefined" && createPortal(
                            <NotificationDropdown
                                bellRef={bellRef}
                                notifications={notifications}
                                unreadCount={unreadCount}
                                onClose={() => setBellOpen(false)}
                                onNavigate={(path) => {
                                    setBellOpen(false);
                                    setUnreadCount(0);
                                    router.push(path);
                                }}
                                formatRelativeTime={formatRelativeTime}
                            />,
                            document.body
                        )}
                    </div>
                    <div className="flex-1 relative z-10 overflow-y-auto overflow-x-hidden">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
