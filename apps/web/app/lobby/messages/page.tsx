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
          <div className="flex items-center justify-center h-full bg-muted/20 animate-in fade-in duration-500">
            <div className="text-center flex flex-col items-center max-w-sm px-6">
              <div className="w-24 h-24 bg-primary/5 text-primary rounded-full flex items-center justify-center mb-6 shadow-sm ring-1 ring-primary/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>
              </div>
              <p className="text-xl font-semibold text-foreground mb-2">Your Messages</p>
              <p className="text-sm text-muted-foreground">
                Select an existing conversation from the list to continue chatting, or search for someone new to send your first message.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
