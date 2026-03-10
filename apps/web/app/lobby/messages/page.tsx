"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import ConversationList from "@/components/chat/conversation-list";
import MessageThread from "@/components/chat/message-thread";

export default function MessagesPage() {
  const { data: session } = useSession();
  const [activeConversationId, setActiveConversationId] = useState<
    string | undefined
  >();

  if (!session?.user?.id) {
    return null;
  }

  return (
    <div className="flex h-full">
      {/* Left panel: Conversation list */}
      <div
        className={`border-r bg-card flex-shrink-0 ${
          activeConversationId ? "hidden md:flex md:w-80" : "w-full md:w-80"
        } flex-col`}
      >
        <div className="p-3 border-b">
          <h2 className="font-semibold text-lg">Messages</h2>
        </div>
        <ConversationList
          currentUserId={session.user.id}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
        />
      </div>

      {/* Right panel: Message thread */}
      <div
        className={`flex-1 flex flex-col ${
          activeConversationId ? "flex" : "hidden md:flex"
        }`}
      >
        {activeConversationId ? (
          <>
            {/* Mobile back button */}
            <div className="md:hidden border-b p-2">
              <button
                onClick={() => setActiveConversationId(undefined)}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                ← Back
              </button>
            </div>
            <MessageThread
              conversationId={activeConversationId}
              currentUserId={session.user.id}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <div className="text-5xl mb-3">💬</div>
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-1">
                Or search for a user to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
