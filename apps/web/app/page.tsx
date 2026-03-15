import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import dynamic from "next/dynamic";

const LandingClient = dynamic(() => import("./landing-client"), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
    </div>
  ),
});

export default async function HomePage() {
  const session = await auth();

  // Fetch the user's actual profile avatar if authenticated
  let profileData: { avatarUrl: string | null; displayName: string } | null = null;
  if (session?.user?.id) {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      select: { avatarUrl: true, displayName: true },
    });
    profileData = profile;
  }

  return <LandingClient session={session} profile={profileData} />;
}
