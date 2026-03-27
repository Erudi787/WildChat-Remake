"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  RotateCcw,
  Trash2,
  Filter,
  CheckSquare,
  Square,
  Minus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  displayName: string;
  avatarUrl: string | null;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const statusTabs = ["ALL", "PENDING", "ACTIVE", "SUSPENDED", "REJECTED"] as const;

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  ACTIVE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  SUSPENDED: "bg-destructive/10 text-destructive border-destructive/20",
  REJECTED: "bg-muted text-muted-foreground border-muted",
};

const roleColors: Record<string, string> = {
  ADMIN: "bg-primary/10 text-primary border-primary/20",
  MODERATOR: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  USER: "bg-muted text-muted-foreground border-muted",
};

export default function UserManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "ALL");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [acting, setActing] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    params.set("page", String(page));
    params.set("limit", "15");

    try {
      const res = await fetch(`/api/admin/users?${params}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Selection helpers
  const allSelected = data?.users.length ? data.users.every((u) => selected.has(u.id)) : false;
  const someSelected = data?.users.some((u) => selected.has(u.id)) && !allSelected;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data?.users.map((u) => u.id) || []));
    }
  }

  function toggleOne(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  async function bulkAction(action: "approve" | "reject" | "suspend" | "reactivate") {
    if (selected.size === 0) return;
    setActing(true);
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: Array.from(selected), action }),
      });
      setSelected(new Set());
      fetchUsers();
    } finally {
      setActing(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          User Management
        </h1>
        <p className="text-muted-foreground mt-1">
          {data ? `${data.total} total users` : "Loading..."}
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, username, or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 rounded-xl bg-white/50 dark:bg-black/20 border-white/20 h-11"
          />
        </div>
        <div className="flex items-center gap-1 glass-card rounded-xl p-1">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { setStatusFilter(tab); setPage(1); }}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                statusFilter === tab
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/10"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <div className="glass-card rounded-xl p-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="text-sm font-semibold text-muted-foreground">
            {selected.size} selected
          </span>
          <div className="flex-1" />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => bulkAction("approve")}
            disabled={acting}
            className="text-emerald-600 hover:bg-emerald-500/10"
          >
            <Check className="w-4 h-4 mr-1" /> Approve
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => bulkAction("reject")}
            disabled={acting}
            className="text-destructive hover:bg-destructive/10"
          >
            <X className="w-4 h-4 mr-1" /> Reject
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => bulkAction("suspend")}
            disabled={acting}
            className="text-amber-600 hover:bg-amber-500/10"
          >
            <Filter className="w-4 h-4 mr-1" /> Suspend
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelected(new Set())}
            className="text-muted-foreground"
          >
            Clear
          </Button>
        </div>
      )}

      {/* User Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[40px_1fr_1fr_100px_100px_120px_80px] gap-4 px-5 py-3 border-b border-white/10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <button onClick={toggleAll} className="flex items-center justify-center">
            {allSelected ? (
              <CheckSquare className="w-4 h-4 text-primary" />
            ) : someSelected ? (
              <Minus className="w-4 h-4 text-primary" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>
          <span>User</span>
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
          <span>Registered</span>
          <span>Actions</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading...</div>
        ) : !data?.users.length ? (
          <div className="p-12 text-center text-muted-foreground">No users found.</div>
        ) : (
          data.users.map((user) => (
            <div
              key={user.id}
              className={`grid grid-cols-[40px_1fr_1fr_100px_100px_120px_80px] gap-4 px-5 py-3 border-b border-white/5 items-center hover:bg-white/5 dark:hover:bg-white/[0.02] transition-colors ${
                selected.has(user.id) ? "bg-primary/5" : ""
              }`}
            >
              {/* Checkbox */}
              <button onClick={() => toggleOne(user.id)} className="flex items-center justify-center">
                {selected.has(user.id) ? (
                  <CheckSquare className="w-4 h-4 text-primary" />
                ) : (
                  <Square className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {/* User info */}
              <Link href={`/admin/users/${user.id}`} className="flex items-center gap-3 min-w-0 group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0 overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user.displayName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                    {user.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                </div>
              </Link>

              {/* Email */}
              <span className="text-sm text-muted-foreground truncate">{user.email}</span>

              {/* Role */}
              <span className={`text-xs font-semibold px-2 py-1 rounded-md border w-fit ${roleColors[user.role]}`}>
                {user.role}
              </span>

              {/* Status */}
              <span className={`text-xs font-semibold px-2 py-1 rounded-md border w-fit ${statusColors[user.status]}`}>
                {user.status}
              </span>

              {/* Registered */}
              <span className="text-xs text-muted-foreground">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>

              {/* Quick actions */}
              <div className="flex items-center gap-1">
                <Link
                  href={`/admin/users/${user.id}`}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                  title="View details"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.page} of {data.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
