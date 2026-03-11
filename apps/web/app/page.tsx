import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await auth();

  // Redirect authenticated users to the lobby
  if (session?.user) {
    redirect("/lobby");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 gradient-maroon-gold text-white">
      <div className="text-center space-y-6 max-w-lg">
        <div className="text-7xl mb-4">🐾</div>
        <h1 className="text-5xl font-bold tracking-tight">WildChat</h1>
        <p className="text-xl text-white/80">Love Purrs Around Campus</p>
        <p className="text-sm text-white/60">
          A campus chat experience for CIT-U Wildcats
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Link href="/auth">
            <Button
              variant="outline"
              size="lg"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/auth">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
