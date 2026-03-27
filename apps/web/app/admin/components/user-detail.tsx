"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  X,
  Ban,
  RotateCcw,
  Trash2,
  MessageSquare,
  MessagesSquare,
  Calendar,
  Mail,
  Phone,
  User as UserIcon,
  Shield,
  ShieldCheck,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserDetailProps {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    displayName: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    bio: string | null;
    avatarUrl: string | null;
    messageCount: number;
    conversationCount: number;
  };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  ACTIVE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  SUSPENDED: "bg-destructive/10 text-destructive border-destructive/20",
  REJECTED: "bg-muted text-muted-foreground border-muted",
};

const roleIcons: Record<string, typeof UserIcon> = {
  ADMIN: Crown,
  MODERATOR: ShieldCheck,
  USER: Shield,
};

export default function UserDetail({ user }: UserDetailProps) {
  const router = useRouter();
  const [acting, setActing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(user.status);
  const [currentRole, setCurrentRole] = useState(user.role);

  async function handleAction(action: string) {
    setActing(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentStatus(data.status);
        router.refresh();
      }
    } finally {
      setActing(false);
    }
  }

  async function handleRoleChange(role: string) {
    setActing(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentRole(data.role);
        router.refresh();
      }
    } finally {
      setActing(false);
    }
  }

  async function handleDelete() {
    setActing(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/admin/users");
        router.refresh();
      }
    } finally {
      setActing(false);
    }
  }

  const RoleIcon = roleIcons[currentRole] || Shield;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back link */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </Link>

      {/* Profile Header */}
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-2xl shrink-0 ring-4 ring-white/10 overflow-hidden">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              user.displayName.charAt(0).toUpperCase()
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{user.displayName}</h1>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${statusColors[currentStatus]}`}>
                {currentStatus}
              </span>
            </div>
            <p className="text-muted-foreground">@{user.username}</p>
            {user.bio && (
              <p className="text-sm text-muted-foreground/80 max-w-md">{user.bio}</p>
            )}
          </div>

          {/* Role Badge */}
          <div className="flex items-center gap-2 glass-card rounded-xl px-4 py-2 shrink-0">
            <RoleIcon className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">{currentRole}</span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Contact Info */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Contact Info
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{user.phone}</span>
              </div>
            )}
            {(user.firstName || user.lastName) && (
              <div className="flex items-center gap-3">
                <UserIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {[user.firstName, user.lastName].filter(Boolean).join(" ")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Activity Stats */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Activity
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{user.messageCount} messages sent</span>
            </div>
            <div className="flex items-center gap-3">
              <MessagesSquare className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{user.conversationCount} conversations</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                Registered {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Actions */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Status Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {currentStatus === "PENDING" && (
            <>
              <Button
                onClick={() => handleAction("approve")}
                disabled={acting}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <Check className="w-4 h-4 mr-2" /> Approve
              </Button>
              <Button
                onClick={() => handleAction("reject")}
                disabled={acting}
                variant="outline"
                className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <X className="w-4 h-4 mr-2" /> Reject
              </Button>
            </>
          )}
          {currentStatus === "ACTIVE" && (
            <Button
              onClick={() => handleAction("suspend")}
              disabled={acting}
              variant="outline"
              className="rounded-xl border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
            >
              <Ban className="w-4 h-4 mr-2" /> Suspend
            </Button>
          )}
          {(currentStatus === "SUSPENDED" || currentStatus === "REJECTED") && (
            <Button
              onClick={() => handleAction("reactivate")}
              disabled={acting}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Reactivate
            </Button>
          )}
        </div>
      </div>

      {/* Role Management */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Role
        </h2>
        <div className="flex gap-2">
          {(["USER", "MODERATOR", "ADMIN"] as const).map((role) => (
            <button
              key={role}
              onClick={() => handleRoleChange(role)}
              disabled={acting || currentRole === role}
              className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all duration-200 disabled:opacity-50 ${
                currentRole === role
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "border-white/20 text-muted-foreground hover:text-foreground hover:bg-white/10"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      {currentRole !== "ADMIN" && (
        <div className="glass-card rounded-2xl p-6 border-destructive/20 space-y-4">
          <h2 className="text-sm font-semibold text-destructive uppercase tracking-wider">
            Danger Zone
          </h2>
          {!showDeleteConfirm ? (
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="outline"
              className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete User
            </Button>
          ) : (
            <div className="glass-card rounded-xl p-4 border-destructive/20 space-y-3">
              <p className="text-sm font-medium text-destructive">
                Are you sure? This will permanently delete <strong>@{user.username}</strong> and all their
                messages, conversations, and profile data. This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleDelete}
                  disabled={acting}
                  className="rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  {acting ? "Deleting..." : "Yes, delete permanently"}
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="ghost"
                  className="rounded-lg"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
