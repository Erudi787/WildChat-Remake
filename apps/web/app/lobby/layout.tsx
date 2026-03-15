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

    // Check if user has completed onboarding
    const profile = await prisma.userProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (!profile) {
        redirect("/onboarding");
    }

    return (
        <ProfileProvider initialProfile={{ name: profile.displayName, avatarUrl: profile.avatarUrl }}>
            <LobbyShell
                user={{
                    id: session.user.id,
                    name: profile.displayName,
                    avatarUrl: profile.avatarUrl,
                }}
            >
                {children}
            </LobbyShell>
        </ProfileProvider>
    );
}
