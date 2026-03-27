import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import UserDetail from "../../components/user-detail";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      profile: {
        select: {
          displayName: true,
          firstName: true,
          lastName: true,
          phone: true,
          bio: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: {
          messages: true,
          conversations: true,
        },
      },
    },
  });

  if (!user) notFound();

  return (
    <UserDetail
      user={{
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        displayName: user.profile?.displayName || user.username,
        firstName: user.profile?.firstName || null,
        lastName: user.profile?.lastName || null,
        phone: user.profile?.phone || null,
        bio: user.profile?.bio || null,
        avatarUrl: user.profile?.avatarUrl || null,
        messageCount: user._count.messages,
        conversationCount: user._count.conversations,
      }}
    />
  );
}
