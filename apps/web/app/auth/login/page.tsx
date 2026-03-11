"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid username or password");
        setLoading(false);
        return;
      }

      // Check if user has a profile (for onboarding redirect)
      const profileRes = await fetch("/api/user/profile");
      const { profile } = await profileRes.json();

      if (!profile) {
        router.push("/onboarding");
      } else {
        router.push("/lobby");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-background relative overflow-hidden selection:bg-primary/20">
      {/* Ambient Background Blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob pointer-events-none"></div>
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000 pointer-events-none"></div>

      <div className="w-full max-w-md glass-card rounded-[2rem] p-8 shadow-2xl relative z-10">
        <div className="text-center space-y-3 mb-8">
          <div className="mx-auto bg-gradient-to-br from-primary/10 to-accent/10 w-20 h-20 rounded-full flex items-center justify-center shadow-inner mb-4 ring-2 ring-white/20">
            <span className="text-4xl drop-shadow-sm">🐾</span>
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">Welcome Back</h1>
          <p className="text-muted-foreground font-medium">
            Sign in to WildChat
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive font-medium text-center shadow-sm">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground/80 font-semibold ml-1">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                autoFocus
                className="rounded-full bg-white/50 dark:bg-black/20 border-white/20 shadow-inner px-5 h-12 focus-visible:ring-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/80 font-semibold ml-1">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="rounded-full bg-white/50 dark:bg-black/20 border-white/20 shadow-inner px-5 h-12 focus-visible:ring-primary/30 pr-12"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors text-xs font-semibold uppercase tracking-wider bg-white/50 dark:bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              className="w-full rounded-full h-12 font-bold text-base shadow-lg hover:shadow-primary/25 hover:scale-[1.02] bg-gradient-to-r from-primary to-accent transition-all"
              disabled={loading || !username || !password}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-sm text-muted-foreground text-center font-medium">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="text-primary hover:text-accent font-bold transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
