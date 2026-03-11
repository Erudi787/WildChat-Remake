"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import MessageInput from "./message-input";
import { useSocket, SocketMessage } from "@/hooks/use-socket";
import { Skeleton } from "@/components/ui/skeleton";
import TypingIndicator from "./typing-indicator";

interface MessageSender {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

interface ChatMessage {
  id: string;
  content: string;
  type: string;
  senderId: string;
  createdAt: string;
  sender: MessageSender;
}

interface MessageThreadProps {
  conversationId: string;
  currentUserId: string;
}

export default function MessageThread({
  conversationId,
  currentUserId,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Socket.IO hook — receives messages in realtime
  const { connected, emitTypingStart, emitTypingStop } = useSocket({
    conversationId,
    onNewMessage: (msg: SocketMessage) => {
      // Only add if message is for this conversation and not already in list
      if (msg.conversationId === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    },
    onTypingStart: (data) => {
      if (data.userId !== currentUserId) {
        setTypingUser(data.displayName);
        // Auto-clear after 3 seconds
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
      }
    },
    onTypingStop: (data) => {
      if (data.userId !== currentUserId) {
        setTypingUser(null);
      }
    },
  });

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/conversations/${conversationId}/messages?limit=50`
      );
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages.reverse());
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Initial load
  useEffect(() => {
    setMessages([]);
    setLoading(true);
    fetchMessages();
  }, [fetchMessages]);

  // Fallback polling only when Socket.IO is not connected
  useEffect(() => {
    if (connected) return; // No need to poll if socket is live
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages, connected]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  // Auto-scroll smarter logic
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 150;

    if (isInitialLoad.current && messages.length > 0) {
      // First load: instantly snap to bottom
      messagesEndRef.current?.scrollIntoView();
      // Use a short timeout to ensure layout has painted before turning off initial load flag
      setTimeout(() => {
        isInitialLoad.current = false;
      }, 100);
    } else if (isNearBottom) {
      // New message while at bottom: smooth scroll
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mark as read
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      fetch(`/api/conversations/${conversationId}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: lastMsg.id }),
      }).catch(() => { });
    }
  }, [conversationId, messages]);

  async function handleSendMessage(content: string) {
    try {
      const res = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }
      );
      const data = await res.json();
      if (data.message) {
        // Optimistically add if not already present from socket
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
      emitTypingStop();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }

  function handleTyping() {
    emitTypingStart(""); // displayName handled server-side
  }

  function formatMessageTime(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function shouldShowDateSeparator(idx: number) {
    if (idx === 0) return true;
    const current = new Date(messages[idx].createdAt).toDateString();
    const prev = new Date(messages[idx - 1].createdAt).toDateString();
    return current !== prev;
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full p-4 space-y-6">
        {[1, 2, 3, 4].map((i) => {
          const isOwn = i % 2 !== 0;
          return (
            <div
              key={i}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] space-y-1 flex flex-col ${
                  isOwn ? "items-end" : "items-start"
                }`}
              >
                {!isOwn && <Skeleton className="h-3 w-16 mb-1" />}
                <Skeleton
                  className={`h-10 rounded-2xl ${
                    i === 1 ? "w-48" : i === 2 ? "w-64" : i === 3 ? "w-32" : "w-56"
                  } ${
                    isOwn ? "rounded-br-md" : "rounded-bl-md"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Connection status */}
      {connected && (
        <div className="px-4 py-1 bg-green-50 text-green-700 text-xs text-center border-b">
          🟢 Connected — messages update instantly
        </div>
      )}

      {/* Messages area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full animate-in fade-in duration-500 delay-150 fill-mode-both">
            <div className="text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-accent/20 text-accent-foreground rounded-full flex items-center justify-center mb-4 shadow-sm">
                <span className="text-4xl translate-x-1">👋</span>
              </div>
              <p className="text-sm font-medium text-foreground">Say hello!</p>
              <p className="text-xs text-muted-foreground mt-1">
                Send a message to start the conversation
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = msg.senderId === currentUserId;
            const showDate = shouldShowDateSeparator(idx);

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex items-center justify-center my-6 sticky top-2 z-10 pointer-events-none">
                    <span className="text-[11px] font-medium text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border shadow-sm">
                      {new Date(msg.createdAt).toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
                <div
                  className={`flex ${isOwn ? "justify-end" : "justify-start"
                    } mb-1.5 group/msg`}
                >
                  <div
                    className={`max-w-[75%] rounded-[1.25rem] px-5 py-2.5 shadow-sm transition-all relative overflow-hidden ${isOwn
                        ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),_0_2px_10px_rgba(128,0,0,0.2)] group-hover/msg:-translate-y-px group-hover/msg:shadow-md"
                        : "glass-card rounded-bl-sm group-hover/msg:-translate-y-px group-hover/msg:shadow-md"
                      }`}
                  >
                    {!isOwn && (
                      <p className="text-[11px] font-bold mb-0.5 tracking-wide text-primary uppercase opacity-90">
                        {msg.sender.displayName}
                      </p>
                    )}
                    <p className="text-[15px] whitespace-pre-wrap break-words leading-relaxed">
                      {msg.content}
                    </p>
                    <p
                      className={`text-[10px] mt-1 select-none flex justify-end font-medium ${isOwn
                          ? "text-primary-foreground/80 mix-blend-plus-lighter"
                          : "text-muted-foreground/70"
                        }`}
                    >
                      {formatMessageTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Typing indicator */}
      <div className="relative">
        {typingUser && (
          <div className="absolute bottom-full left-0 right-0 pt-4 pb-1 z-10">
            <TypingIndicator name={typingUser} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="relative z-20">
        <MessageInput onSend={handleSendMessage} onTyping={handleTyping} />
      </div>
    </div>
  );
}
