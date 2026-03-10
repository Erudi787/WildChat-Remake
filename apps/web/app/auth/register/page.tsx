"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

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
        <main className="flex min-h-screen items-center justify-center p-4 gradient-maroon-gold">
            <Card className="w-full max-w-md shadow-xl border-0">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto mb-2">
                        <span className="text-4xl">🐾</span>
                    </div>
                    <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                    <CardDescription>
                        Join WildChat — Love Purrs Around Campus
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Choose a username"
                                value={form.username}
                                onChange={(e) => updateField("username", e.target.value)}
                                required
                                autoComplete="username"
                                autoFocus
                                className={hasError("username") ? "border-destructive" : ""}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.edu"
                                value={form.email}
                                onChange={(e) => updateField("email", e.target.value)}
                                required
                                autoComplete="email"
                                className={hasError("email") ? "border-destructive" : ""}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Minimum 8 characters"
                                    value={form.password}
                                    onChange={(e) => updateField("password", e.target.value)}
                                    required
                                    autoComplete="new-password"
                                    className={hasError("password") ? "border-destructive" : ""}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="Re-enter your password"
                                value={form.confirmPassword}
                                onChange={(e) => updateField("confirmPassword", e.target.value)}
                                required
                                autoComplete="new-password"
                                className={
                                    hasError("confirmPassword") ? "border-destructive" : ""
                                }
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-3">
                        <Button
                            type="submit"
                            className="w-full"
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
                        <p className="text-sm text-muted-foreground text-center">
                            Already have an account?{" "}
                            <Link
                                href="/auth/login"
                                className="text-primary font-medium hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </main>
    );
}
