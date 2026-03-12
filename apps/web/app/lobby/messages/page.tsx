import { auth } from "@/auth";
import { redirect } from "next/navigation";
import MessagesClientShell from "./messages-client-shell";

export const metadata = {
  title: "Messages - WildChat",
};

export default async function MessagesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth");
  }

  return <MessagesClientShell currentUserId={session.user.id} />;
}

