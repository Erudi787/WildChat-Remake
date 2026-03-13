import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import SettingsClient from "./settings-client";

export const metadata = {
  title: "Settings - WildChat",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth");
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      displayName: true,
      firstName: true,
      lastName: true,
      phone: true,
      bio: true,
      avatarUrl: true,
    },
  });

  if (!profile) {
    redirect("/onboarding");
  }

  return <SettingsClient initialProfile={profile} />;
}
