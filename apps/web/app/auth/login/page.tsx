import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <p className="mt-2 text-muted-foreground">
        Auth flow will be implemented in Phase 1
      </p>
      <Button className="mt-4" disabled>
        Coming soon
      </Button>
    </main>
  );
}
