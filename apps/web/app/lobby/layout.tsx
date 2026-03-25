import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import LobbyShell from "./lobby-shell";
import { ProfileProvider } from "@/contexts/profile-context";

export default async function LobbyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/auth");
    }

    // Only ACTIVE users (or ADMINs) can access the lobby
    const user = session.user as any;
    if (user.role !== "ADMIN" && user.status !== "ACTIVE") {
        redirect("/pending");
    }

    // Check if user has completed onboarding
    const profile = await prisma.userProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (!profile) {
        redirect("/onboarding");
    }

    const userId = session.user.id;

    // Fetch recent unread messages for the notification dropdown
    const recentUnread = await prisma.conversationParticipant.findMany({
        where: { userId },
        include: {
            conversation: {
                include: {
                    messages: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                        select: {
                            id: true,
                            content: true,
                            senderId: true,
                            createdAt: true,
                            sender: {
                                select: {
                                    profile: {
                                        select: { displayName: true, avatarUrl: true },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: { conversation: { updatedAt: "desc" } },
    });

    const initialNotifications = recentUnread
        .filter((p) => {
            const lastMsg = p.conversation.messages[0];
            // Only include if there's a message, it's unread, and not sent by current user
            return lastMsg && lastMsg.id !== p.lastReadMessageId && lastMsg.senderId !== userId;
        })
        .map((p) => {
            const msg = p.conversation.messages[0]!;
            return {
                id: msg.id,
                senderName: msg.sender.profile?.displayName || "Unknown",
                senderAvatar: msg.sender.profile?.avatarUrl || null,
                content: msg.content,
                conversationId: p.conversationId,
                createdAt: msg.createdAt.toISOString(),
            };
        })
        .slice(0, 10);

    return (
        <ProfileProvider initialProfile={{ name: profile.displayName, avatarUrl: profile.avatarUrl }}>
            <LobbyShell
                user={{
                    id: userId,
                    name: profile.displayName,
                    avatarUrl: profile.avatarUrl,
                }}
                initialNotifications={initialNotifications}
            >
                {children}
            </LobbyShell>
        </ProfileProvider>
    );
}
