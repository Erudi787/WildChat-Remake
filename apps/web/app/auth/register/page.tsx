"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [fieldError, setFieldError] = useState("");
    const [loading, setLoading] = useState(false);

    function updateField(field: string, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
        setError("");
        setFieldError("");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setFieldError("");

        // Client-side validation
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match");
            setFieldError("confirmPassword");
            return;
        }

        if (form.password.length < 8) {
            setError("Password must be at least 8 characters");
            setFieldError("password");
            return;
        }

        if (form.username.length < 3) {
            setError("Username must be at least 3 characters");
            setFieldError("username");
            return;
        }

        setLoading(true);

        try {
            // Register
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: form.username,
                    email: form.email,
                    password: form.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Registration failed");
                if (data.field) setFieldError(data.field);
                setLoading(false);
                return;
            }

            // Auto-login after registration
            const signInRes = await signIn("credentials", {
                username: form.username,
                password: form.password,
                redirect: false,
            });

            if (signInRes?.error) {
                setError("Account created but login failed. Please sign in manually.");
                setLoading(false);
                router.push("/auth/login");
                return;
            }

            // New users always go to onboarding
            router.push("/onboarding");
        } catch {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    }

    const hasError = (field: string) => fieldError === field;

    return (
        <main className="flex min-h-screen items-center justify-center p-4 bg-background relative overflow-hidden selection:bg-primary/20">
            {/* Ambient Background Blobs */}
            <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob pointer-events-none"></div>
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 pointer-events-none"></div>
            <div className="absolute -bottom-20 right-1/3 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000 pointer-events-none"></div>

            <div className="w-full max-w-md glass-card rounded-[2rem] p-8 shadow-2xl relative z-10 my-8">
                <div className="text-center space-y-3 mb-8">
                    <div className="mx-auto bg-gradient-to-br from-primary/10 to-accent/10 w-16 h-16 rounded-full flex items-center justify-center shadow-inner mb-4 ring-2 ring-white/20">
                        <span className="text-3xl drop-shadow-sm">✨</span>
                    </div>
                    <h1 className="text-3xl font-extrabold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">Create Account</h1>
                    <p className="text-muted-foreground font-medium">
                        Join WildChat today
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
                                placeholder="Choose a username"
                                value={form.username}
                                onChange={(e) => updateField("username", e.target.value)}
                                required
                                autoComplete="username"
                                autoFocus
                                className={`rounded-full bg-white/50 dark:bg-black/20 border-white/20 shadow-inner px-5 h-12 focus-visible:ring-primary/30 ${hasError("username") ? "border-destructive ring-1 ring-destructive" : ""}`}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-foreground/80 font-semibold ml-1">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.edu"
                                value={form.email}
                                onChange={(e) => updateField("email", e.target.value)}
                                required
                                autoComplete="email"
                                className={`rounded-full bg-white/50 dark:bg-black/20 border-white/20 shadow-inner px-5 h-12 focus-visible:ring-primary/30 ${hasError("email") ? "border-destructive ring-1 ring-destructive" : ""}`}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-foreground/80 font-semibold ml-1">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Minimum 8 characters"
                                    value={form.password}
                                    onChange={(e) => updateField("password", e.target.value)}
                                    required
                                    autoComplete="new-password"
                                    className={`rounded-full bg-white/50 dark:bg-black/20 border-white/20 shadow-inner px-5 h-12 focus-visible:ring-primary/30 pr-12 ${hasError("password") ? "border-destructive ring-1 ring-destructive" : ""}`}
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

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-foreground/80 font-semibold ml-1">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="Re-enter your password"
                                value={form.confirmPassword}
                                onChange={(e) => updateField("confirmPassword", e.target.value)}
                                required
                                autoComplete="new-password"
                                className={`rounded-full bg-white/50 dark:bg-black/20 border-white/20 shadow-inner px-5 h-12 focus-visible:ring-primary/30 ${hasError("confirmPassword") ? "border-destructive ring-1 ring-destructive" : ""}`}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col space-y-4 pt-2">
                        <Button
                            type="submit"
                            className="w-full rounded-full h-12 font-bold text-base shadow-lg hover:shadow-primary/25 hover:scale-[1.02] bg-gradient-to-r from-primary to-accent transition-all"
                            disabled={
                                loading ||
                                !form.username ||
                                !form.email ||
                                !form.password ||
                                !form.confirmPassword
                            }
                        >
                            {loading ? "Creating account..." : "Create Account"}
                        </Button>
                        <p className="text-sm text-muted-foreground text-center font-medium">
                            Already have an account?{" "}
                            <Link
                                href="/auth/login"
                                className="text-primary hover:text-accent font-bold transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </main>
    );
}
