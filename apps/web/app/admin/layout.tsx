import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminShell from "./components/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth");
  }

  const user = session.user as any;
  if (user.role !== "ADMIN" && user.role !== "MODERATOR") {
    redirect("/lobby");
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { displayName: true, avatarUrl: true },
  });

  const pendingCount = await prisma.user.count({
    where: { status: "PENDING" },
  });

  return (
    <AdminShell
      user={{
        id: session.user.id,
        name: profile?.displayName || session.user.name || "Admin",
        avatarUrl: profile?.avatarUrl || null,
        role: user.role,
      }}
      pendingCount={pendingCount}
    >
      {children}
    </AdminShell>
  );
}
