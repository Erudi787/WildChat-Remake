import { auth } from "@/auth";
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

  return <LandingClient session={session} />;
}
