"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Clock,
  CheckCircle2,
  ShieldAlert,
  MessageSquare,
  MessagesSquare,
  TrendingUp,
  Check,
  X,
} from "lucide-react";

interface Stats {
  totalUsers: number;
  pendingUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalMessages: number;
  totalConversations: number;
  recentRegistrations: number;
}

interface PendingUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
}

interface AdminDashboardProps {
  stats: Stats;
  pendingList: PendingUser[];
}

const statCards = [
  { key: "totalUsers", label: "Total Users", icon: Users, color: "primary" },
  { key: "pendingUsers", label: "Pending Approval", icon: Clock, color: "amber-500" },
  { key: "activeUsers", label: "Active Users", icon: CheckCircle2, color: "emerald-500" },
  { key: "suspendedUsers", label: "Suspended", icon: ShieldAlert, color: "destructive" },
  { key: "totalMessages", label: "Messages", icon: MessageSquare, color: "blue-500" },
  { key: "totalConversations", label: "Conversations", icon: MessagesSquare, color: "violet-500" },
] as const;

export default function AdminDashboard({ stats, pendingList }: AdminDashboardProps) {
  const router = useRouter();
  const [acting, setActing] = useState<Record<string, boolean>>({});
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  async function handleAction(userId: string, action: "approve" | "reject") {
    setActing((prev) => ({ ...prev, [userId]: true }));
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setDismissed((prev) => new Set(prev).add(userId));
        router.refresh();
      }
    } finally {
      setActing((prev) => ({ ...prev, [userId]: false }));
    }
  }

  const visiblePending = pendingList.filter((u) => !dismissed.has(u.id));

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview of WildChat platform activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map(({ key, label, icon: Icon, color }, i) => (
          <div
            key={key}
            className="glass-card p-5 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}/10 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-5 h-5 text-${color}`} />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {label}
                </span>
              </div>
              <p className="text-3xl font-extrabold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                {(stats as any)[key].toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Registrations Stat */}
      <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-emerald-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-muted-foreground">New registrations (last 7 days)</p>
          <p className="text-2xl font-extrabold">{stats.recentRegistrations}</p>
        </div>
      </div>

      {/* Pending Approvals Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Pending Approvals</h2>
          {stats.pendingUsers > 0 && (
            <Link
              href="/admin/users?status=PENDING"
              className="text-sm text-primary font-semibold hover:underline"
            >
              View all ({stats.pendingUsers})
            </Link>
          )}
        </div>

        {visiblePending.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-semibold text-foreground">All caught up!</p>
            <p className="text-sm text-muted-foreground mt-1">No pending registrations to review.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visiblePending.map((user) => (
              <div
                key={user.id}
                className="glass-card rounded-xl p-4 flex items-center gap-4 group hover:bg-white/60 dark:hover:bg-black/60 transition-all duration-300"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0 ring-2 ring-white/10 overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user.displayName.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    @{user.username} &middot; {user.email}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    Registered {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleAction(user.id, "approve")}
                    disabled={acting[user.id]}
                    className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                    title="Approve"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAction(user.id, "reject")}
                    disabled={acting[user.id]}
                    className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
                    title="Reject"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
