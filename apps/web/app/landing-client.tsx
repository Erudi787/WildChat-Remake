"use client";

import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { PawPrint, LogOut, ArrowUp, MessageSquare, ShieldCheck, Sparkles, Bell } from "lucide-react";
import { signOut } from "next-auth/react";
import { getUserAvatarGradient } from "@/lib/utils";
import { useSocket, SocketMessage } from "@/hooks/use-socket";

interface NotifItem {
    id: string;
    senderName: string;
    senderAvatar: string | null;
    content: string;
    conversationId: string;
    createdAt: string;
}

interface LandingClientProps {
    session: any;
    profile?: { avatarUrl: string | null; displayName: string } | null;
    unreadCount?: number;
    initialNotifications?: NotifItem[];
}

export default function LandingClient({ session, profile, unreadCount: initialUnread = 0, initialNotifications = [] }: LandingClientProps) {
    const router = useRouter();
    const user = session?.user;
    const [notifications, setNotifications] = useState<NotifItem[]>(initialNotifications);
    const [scrolled, setScrolled] = useState(false);
    const [bellOpen, setBellOpen] = useState(false);
    const [liveUnread, setLiveUnread] = useState(initialUnread);
    const bellBtnRef = useRef<HTMLButtonElement>(null);
    const bellDropdownRef = useRef<HTMLDivElement>(null);
    const [bellPos, setBellPos] = useState<{ top: number; right: number } | null>(null);

    // Listen for new messages via WebSocket (only when authenticated)
    useSocket(user ? {
        onConversationUpdated: useCallback((data: { conversationId: string; lastMessage: SocketMessage }) => {
            if (data.lastMessage.senderId === user?.id) return;
            setLiveUnread((c) => c + 1);
            setNotifications((prev) => {
                const item: NotifItem = {
                    id: data.lastMessage.id,
                    senderName: data.lastMessage.sender.displayName,
                    senderAvatar: data.lastMessage.sender.avatarUrl,
                    content: data.lastMessage.content,
                    conversationId: data.conversationId,
                    createdAt: data.lastMessage.createdAt,
                };
                return [item, ...prev.filter((n) => n.id !== item.id)].slice(0, 10);
            });
        }, [user?.id]),
    } : {});

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Position the bell dropdown below the button
    useLayoutEffect(() => {
        if (bellOpen && bellBtnRef.current) {
            const rect = bellBtnRef.current.getBoundingClientRect();
            setBellPos({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right,
            });
        } else {
            setBellPos(null);
        }
    }, [bellOpen]);

    // Close bell dropdown on outside click
    useEffect(() => {
        if (!bellOpen) return;
        const handle = (e: MouseEvent) => {
            if (
                bellDropdownRef.current && !bellDropdownRef.current.contains(e.target as Node) &&
                bellBtnRef.current && !bellBtnRef.current.contains(e.target as Node)
            ) {
                setBellOpen(false);
            }
        };
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, [bellOpen]);
    const displayName = profile?.displayName || user?.name || "WC";
    const userAvatarUrl = profile?.avatarUrl || user?.image || null;
    const initials = displayName
        .split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

    return (
        <div className="min-h-screen relative w-full overflow-x-hidden bg-background text-foreground font-sans selection:bg-primary/20">
            {/* Ambient Background Blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/20 rounded-full blur-[120px] mix-blend-multiply opacity-50 animate-blob" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-secondary/20 rounded-full blur-[140px] mix-blend-multiply opacity-50 animate-blob animation-delay-2000" />
                <div className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] bg-accent/20 rounded-full blur-[100px] mix-blend-multiply opacity-50 animate-blob animation-delay-4000" />
            </div>

            {/* Sticky Header */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg py-4" : "bg-transparent py-6"}`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <PawPrint className="w-8 h-8 text-primary drop-shadow-sm" />
                        <span className="font-bold text-2xl tracking-tight bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                            WildChat
                        </span>
                    </Link>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center gap-3 bg-white/5 dark:bg-black/20 rounded-full pl-2 pr-4 py-1.5 border border-white/10 shadow-sm backdrop-blur-md">
                                    {userAvatarUrl ? (
                                        <img src={userAvatarUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/50" />
                                    ) : (
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-primary/50 ${getUserAvatarGradient(displayName)}`}>
                                            {initials}
                                        </div>
                                    )}
                                    <span className="text-sm font-semibold truncate max-w-[120px] drop-shadow-sm">
                                        {displayName}
                                    </span>
                                </div>
                                <button
                                    ref={bellBtnRef}
                                    onClick={(e) => { e.stopPropagation(); setBellOpen((o) => !o); }}
                                    className="relative p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                                    title="Notifications"
                                >
                                    <Bell className="w-5 h-5" />
                                    {liveUnread > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-md ring-2 ring-background">
                                            {liveUnread > 9 ? "9+" : liveUnread}
                                        </span>
                                    )}
                                </button>
                                {bellOpen && bellPos && typeof document !== "undefined" && createPortal(
                                    <div
                                        ref={bellDropdownRef}
                                        className="fixed w-80 rounded-2xl border border-white/20 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden z-[9999] animate-in fade-in duration-150"
                                        style={{ top: bellPos.top, right: bellPos.right }}
                                    >
                                        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                                            <h3 className="font-bold text-sm">Notifications</h3>
                                            {liveUnread > 0 && (
                                                <span className="text-xs text-primary font-medium">{liveUnread} unread</span>
                                            )}
                                        </div>
                                        <div className="max-h-72 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="px-4 py-8 text-center">
                                                    <Bell className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                                                    <p className="text-sm text-muted-foreground">No new notifications</p>
                                                </div>
                                            ) : (
                                                notifications.map((n) => (
                                                    <button
                                                        key={n.id}
                                                        onClick={() => { setBellOpen(false); router.push(`/lobby/messages?chat=${n.conversationId}`); }}
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
                                                                {(() => {
                                                                    const d = new Date(n.createdAt);
                                                                    const now = new Date();
                                                                    const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
                                                                    if (diff < 1) return "now";
                                                                    if (diff < 60) return `${diff}m`;
                                                                    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
                                                                    return `${Math.floor(diff / 1440)}d`;
                                                                })()}
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
                                                onClick={() => { setBellOpen(false); router.push("/lobby/messages"); }}
                                                className="text-xs text-primary font-semibold hover:underline"
                                            >
                                                View all messages →
                                            </button>
                                        </div>
                                    </div>,
                                    document.body
                                )}
                                <button
                                    onClick={() => router.push('/lobby')}
                                    className="h-10 px-4 rounded-full shadow-lg hover:shadow-primary/25 hover:scale-105 active:scale-95 transition-all bg-gradient-to-r from-primary to-accent text-white font-bold text-sm"
                                >
                                    Go to Dashboard
                                </button>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                    aria-label="Log out"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <Link href="/auth">
                                    <Button variant="ghost" className="rounded-full font-semibold hover:bg-white/10 backdrop-blur-sm">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/auth">
                                    <button className="h-10 px-4 rounded-full shadow-lg hover:shadow-primary/25 hover:scale-105 active:scale-95 transition-all bg-gradient-to-r from-primary to-accent text-white font-bold text-sm">
                                        Get Started
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Hero Section */}
            <main className="relative z-10 flex flex-col items-center justify-center pt-40 px-6 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center w-full"
                >
                    <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-8 rounded-[2.5rem] bg-gradient-to-br from-white/40 to-white/10 dark:from-white/10 dark:to-white/5 backdrop-blur-md shadow-2xl flex items-center justify-center border border-white/20 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                        <span className="text-5xl sm:text-7xl drop-shadow-xl animate-float">🐾</span>
                    </div>

                    <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight mb-6 bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent relative">
                        WildChat
                        <motion.div
                            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-6 -right-4 sm:-right-12 px-4 py-1.5 bg-accent/20 text-accent-foreground backdrop-blur-md rounded-full text-sm font-bold border border-accent/20 shadow-xl"
                        >
                            Wildcats Only 🎓
                        </motion.div>
                    </h1>

                    <p className="text-xl sm:text-3xl text-muted-foreground font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                        Love purrs around campus. Connect, chat, and roar with fellow CIT-U students in an exclusive network.
                    </p>

                    <div className="flex justify-center">
                        {user ? (
                            <button
                                onClick={() => router.push('/lobby')}
                                className="h-14 px-8 rounded-full shadow-[0_0_40px_-10px_rgba(128,0,0,0.5)] hover:shadow-[0_0_60px_-15px_rgba(128,0,0,0.6)] hover:scale-105 active:scale-95 transition-all bg-gradient-to-r from-primary to-accent text-white font-bold text-lg border border-white/10"
                            >
                                Enter the Lobby ➔
                            </button>
                        ) : (
                            <Link href="/auth">
                                <button
                                    className="h-14 px-8 rounded-full shadow-[0_0_40px_-10px_rgba(128,0,0,0.5)] hover:shadow-[0_0_60px_-15px_rgba(128,0,0,0.6)] hover:scale-105 active:scale-95 transition-all bg-gradient-to-r from-primary to-accent text-white font-bold text-lg border border-white/10"
                                >
                                    Join the Community ➔
                                </button>
                            </Link>
                        )}
                    </div>
                </motion.div>

                {/* Features Section */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 mb-32 w-full"
                >
                    <div className="glass-card rounded-[2rem] p-8 hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-6">
                            <MessageSquare className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Real-time Echoes</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Instant messaging built on robust WebSocket connections. Never miss a whisper within the university walls.
                        </p>
                    </div>

                    <div className="glass-card rounded-[2rem] p-8 hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center text-accent mb-6">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Exclusive Network</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            A sealed environment specifically crafted for CIT-U Wildcats. Authenticated safety for an authentic community.
                        </p>
                    </div>

                    <div className="glass-card rounded-[2rem] p-8 hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary mb-6">
                            <Sparkles className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Vibrant Experience</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Immerse yourself in a beautifully crafted, glassmorphic UI that is as dynamic and vibrant as campus life.
                        </p>
                    </div>
                </motion.div>
            </main>

            {/* Scroll-to-Top FAB */}
            <AnimatePresence>
                {scrolled && (
                    <motion.button
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="fixed bottom-8 right-8 z-50 p-4 rounded-full glass-card border border-white/20 text-muted-foreground hover:text-foreground shadow-2xl hover:scale-110 active:scale-95 transition-all group"
                        aria-label="Scroll to top"
                    >
                        <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Footer */}
            <footer className="relative z-10 py-10 border-t border-white/10 bg-white/5 dark:bg-black/20 backdrop-blur-md text-center">
                <p className="text-sm font-medium text-muted-foreground">
                    Designed entirely for CIT-U Wildcats.
                </p>
                <p className="text-xs text-muted-foreground/60 mt-2">
                    WildChat © {new Date().getFullYear()}
                </p>
            </footer>
        </div>
    );
}
