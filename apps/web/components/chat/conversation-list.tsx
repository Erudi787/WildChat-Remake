"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserAvatarGradient } from "@/lib/utils";

interface SearchUser {
  id: string;
  username: string;
  profile: {
    displayName: string;
    avatarUrl: string | null;
  } | null;
}

interface ConversationItem {
  id: string;
  isGroup: boolean;
  updatedAt: string;
  otherUser: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    type: string;
  } | null;
}

interface ConversationListProps {
  currentUserId: string;
  activeConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
}

export default function ConversationList({
  currentUserId,
  activeConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const debounce = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/users/search?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        setSearchResults(data.users || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  async function startConversation(userId: string) {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: userId }),
      });
      const data = await res.json();
      if (data.conversationId) {
        setSearchQuery("");
        setSearchResults([]);
        await fetchConversations();
        onSelectConversation(data.conversationId);
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="p-3 border-b">
        <Input
          type="text"
          placeholder="Search users to chat..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 text-sm"
        />
      </div>

      {/* Search results dropdown */}
      {searchQuery.length >= 2 && (
        <div className="border-b bg-card">
          {searching ? (
            <div className="p-3 text-sm text-muted-foreground text-center">
              Searching...
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground text-center">
              No users found
            </div>
          ) : (
            searchResults.map((user) => (
              <button
                key={user.id}
                onClick={() => startConversation(user.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted/60 transition-colors text-left"
              >
                {user.profile?.avatarUrl ? (
                  <img
                    src={user.profile.avatarUrl}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${getUserAvatarGradient(user.username)}`}>
                    {(user.profile?.displayName || user.username)[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">
                    {user.profile?.displayName || user.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{user.username}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-3 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
            </div>
            <p className="text-sm font-medium text-foreground">No conversations yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
              Search for a user above to start chatting!
            </p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`w-full flex items-center gap-3 p-3 transition-colors text-left border-b ${
                activeConversationId === conv.id
                  ? "bg-primary/10"
                  : "hover:bg-muted/50"
              }`}
            >
              {conv.otherUser?.avatarUrl ? (
                <img
                  src={conv.otherUser.avatarUrl}
                  alt=""
                  className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${getUserAvatarGradient(conv.otherUser?.username || "?")}`}>
                  {(conv.otherUser?.displayName || "?")[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">
                    {conv.otherUser?.displayName || "Unknown"}
                  </p>
                  {conv.lastMessage && (
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      {formatTime(conv.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                {conv.lastMessage ? (
                  <p className="text-xs text-muted-foreground truncate">
                    {conv.lastMessage.senderId === currentUserId ? "You: " : ""}
                    {conv.lastMessage.content}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No messages yet
                  </p>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
