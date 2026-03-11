import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import LobbyShell from "./lobby-shell";

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
        <LobbyShell
            user={{
                id: session.user.id,
                name: profile.displayName,
                avatarUrl: profile.avatarUrl,
            }}
        >
            {children}
        </LobbyShell>
    );
}
