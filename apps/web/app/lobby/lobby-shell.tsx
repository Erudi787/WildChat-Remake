"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface LobbyShellProps {
    user: {
        id: string;
        name: string;
        avatarUrl: string | null;
    };
    children: React.ReactNode;
}

const navItems = [
    { label: "Home", href: "/lobby", icon: "🏠" },
    { label: "Messages", href: "/lobby/messages", icon: "💬" },
    { label: "Settings", href: "/lobby/settings", icon: "⚙️" },
];

export default function LobbyShell({ user, children }: LobbyShellProps) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside
                className={`${sidebarOpen ? "w-64" : "w-16"
                    } flex flex-col border-r bg-card transition-all duration-300 ease-in-out`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    {sidebarOpen && (
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🐾</span>
                            <span className="font-bold text-lg">WildChat</span>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                        aria-label="Toggle sidebar"
                    >
                        {sidebarOpen ? "◀" : "▶"}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-2 space-y-1">
                    {navItems.map((item) => {
                        const isActive =
                            item.href === "/lobby"
                                ? pathname === "/lobby"
                                : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                {sidebarOpen && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="border-t p-3">
                    <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                            <img
                                src={user.avatarUrl}
                                alt={user.name}
                                className="w-9 h-9 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full gradient-maroon-gold flex items-center justify-center text-white text-xs font-bold">
                                {initials}
                            </div>
                        )}
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <button
                                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                                    className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto">{children}</main>
        </div>
    );
}
