"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import MessageInput from "./message-input";
import { useSocket, SocketMessage } from "@/hooks/use-socket";

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

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Loading messages...
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
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <div className="text-4xl mb-2">👋</div>
              <p className="text-sm">
                Send a message to start the conversation!
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
                  <div className="flex items-center justify-center my-4">
                    <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
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
                    } mb-1`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwn
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                      }`}
                  >
                    {!isOwn && (
                      <p className="text-xs font-medium mb-0.5 opacity-70">
                        {msg.sender.displayName}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    <p
                      className={`text-[10px] mt-1 ${isOwn
                          ? "text-primary-foreground/60"
                          : "text-muted-foreground"
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
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingUser && (
        <div className="px-4 py-1 text-xs text-muted-foreground italic border-t">
          {typingUser} is typing...
        </div>
      )}

      {/* Input bar */}
      <MessageInput onSend={handleSendMessage} onTyping={handleTyping} />
    </div>
  );
}
