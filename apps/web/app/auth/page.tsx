"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PawPrint, Sparkles, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    
    // Shared State
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    // Login State
    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Register State
    const [regForm, setRegForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [fieldError, setFieldError] = useState("");

    const updateRegField = (field: string, value: string) => {
        setRegForm((prev) => ({ ...prev, [field]: value }));
        setError("");
        setFieldError("");
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError("");
        setFieldError("");
    };

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await signIn("credentials", {
                username: loginUsername,
                password: loginPassword,
                redirect: false,
            });

            if (res?.error) {
                setError("Invalid username or password");
                setLoading(false);
                return;
            }

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

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setFieldError("");

        if (regForm.password !== regForm.confirmPassword) {
            setError("Passwords do not match");
            setFieldError("confirmPassword");
            return;
        }

        if (regForm.password.length < 8) {
            setError("Password must be at least 8 characters");
            setFieldError("password");
            return;
        }

        if (regForm.username.length < 3) {
            setError("Username must be at least 3 characters");
            setFieldError("username");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: regForm.username,
                    email: regForm.email,
                    password: regForm.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Registration failed");
                if (data.field) setFieldError(data.field);
                setLoading(false);
                return;
            }

            const signInRes = await signIn("credentials", {
                username: regForm.username,
                password: regForm.password,
                redirect: false,
            });

            if (signInRes?.error) {
                setError("Account created but login failed. Please sign in manually.");
                setLoading(false);
                setIsLogin(true); // Switch to login view
                return;
            }

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
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob pointer-events-none"></div>
            <div className="absolute top-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 pointer-events-none"></div>
            <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000 pointer-events-none"></div>

            <div className="w-full max-w-md glass-card rounded-[2rem] p-8 shadow-2xl relative z-10 overflow-hidden">
                <AnimatePresence mode="wait">
                    {isLogin ? (
                        <motion.div
                            key="login"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            <div className="text-center space-y-3 mb-8">
                                <div className="mx-auto bg-gradient-to-br from-primary/10 to-accent/10 w-20 h-20 rounded-full flex items-center justify-center shadow-inner mb-4 ring-2 ring-white/20">
                                    <PawPrint className="w-10 h-10 text-primary drop-shadow-sm" />
                                </div>
                                <h1 className="text-3xl font-extrabold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">Welcome Back</h1>
                                <p className="text-muted-foreground font-medium">
                                    Sign in to WildChat
                                </p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                {error && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive font-medium text-center shadow-sm">
                                        {error}
                                    </motion.div>
                                )}

                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-username" className="text-foreground/80 font-semibold ml-1">Username</Label>
                                        <Input
                                            id="login-username"
                                            type="text"
                                            placeholder="Enter your username"
                                            value={loginUsername}
                                            onChange={(e) => setLoginUsername(e.target.value)}
                                            required
                                            autoComplete="username"
                                            className="rounded-full bg-white/50 dark:bg-black/20 border-white/20 shadow-inner px-5 h-12 focus-visible:ring-primary/30"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="login-password" className="text-foreground/80 font-semibold ml-1">Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="login-password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter your password"
                                                value={loginPassword}
                                                onChange={(e) => setLoginPassword(e.target.value)}
                                                required
                                                autoComplete="current-password"
                                                className="rounded-full bg-white/50 dark:bg-black/20 border-white/20 shadow-inner px-5 h-12 focus-visible:ring-primary/30 pr-12"
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors bg-white/50 dark:bg-black/50 p-1.5 rounded-full backdrop-blur-sm"
                                                onClick={() => setShowPassword(!showPassword)}
                                                tabIndex={-1}
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col space-y-4 pt-2">
                                    <Button
                                        type="submit"
                                        className="w-full rounded-full h-12 font-bold text-base shadow-lg hover:shadow-primary/25 hover:scale-[1.02] bg-gradient-to-r from-primary to-accent transition-all"
                                        disabled={loading || !loginUsername || !loginPassword}
                                    >
                                        {loading ? "Signing in..." : "Sign In"}
                                    </Button>
                                    <p className="text-sm text-muted-foreground text-center font-medium">
                                        Don&apos;t have an account?{" "}
                                        <button
                                            type="button"
                                            onClick={toggleMode}
                                            className="text-primary hover:text-accent font-bold transition-colors"
                                        >
                                            Create one
                                        </button>
                                    </p>
                                </div>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="register"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            <div className="text-center space-y-3 mb-8">
                                <div className="mx-auto bg-gradient-to-br from-primary/10 to-accent/10 w-16 h-16 rounded-full flex items-center justify-center shadow-inner mb-4 ring-2 ring-white/20">
                                    <Sparkles className="w-8 h-8 text-primary drop-shadow-sm" />
                                </div>
                                <h1 className="text-3xl font-extrabold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">Create Account</h1>
                                <p className="text-muted-foreground font-medium">
                                    Join WildChat today
                                </p>
                            </div>

                            <form onSubmit={handleRegister} className="space-y-6">
                                {error && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive font-medium text-center shadow-sm">
                                        {error}
                                    </motion.div>
                                )}

                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-username" className="text-foreground/80 font-semibold ml-1">Username</Label>
                                        <Input
                                            id="reg-username"
                                            type="text"
                                            placeholder="Choose a username"
                                            value={regForm.username}
                                            onChange={(e) => updateRegField("username", e.target.value)}
                                            required
                                            autoComplete="username"
                                            className={`rounded-full bg-white/50 dark:bg-black/20 border-white/20 shadow-inner px-5 h-12 focus-visible:ring-primary/30 ${hasError("username") ? "border-destructive ring-1 ring-destructive" : ""}`}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reg-email" className="text-foreground/80 font-semibold ml-1">Email</Label>
                                        <Input
                                            id="reg-email"
                                            type="email"
                                            placeholder="your@email.edu"
                                            value={regForm.email}
                                            onChange={(e) => updateRegField("email", e.target.value)}
                                            required
                                            autoComplete="email"
                                            className={`rounded-full bg-white/50 dark:bg-black/20 border-white/20 shadow-inner px-5 h-12 focus-visible:ring-primary/30 ${hasError("email") ? "border-destructive ring-1 ring-destructive" : ""}`}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reg-password" className="text-foreground/80 font-semibold ml-1">Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="reg-password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Minimum 8 characters"
                                                value={regForm.password}
                                                onChange={(e) => updateRegField("password", e.target.value)}
                                                required
                                                autoComplete="new-password"
                                                className={`rounded-full bg-white/50 dark:bg-black/20 border-white/20 shadow-inner px-5 h-12 focus-visible:ring-primary/30 pr-12 ${hasError("password") ? "border-destructive ring-1 ring-destructive" : ""}`}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors bg-white/50 dark:bg-black/50 p-1.5 rounded-full backdrop-blur-sm"
                                                onClick={() => setShowPassword(!showPassword)}
                                                tabIndex={-1}
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reg-confirmPassword" className="text-foreground/80 font-semibold ml-1">Confirm Password</Label>
                                        <Input
                                            id="reg-confirmPassword"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Re-enter your password"
                                            value={regForm.confirmPassword}
                                            onChange={(e) => updateRegField("confirmPassword", e.target.value)}
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
                                            !regForm.username ||
                                            !regForm.email ||
                                            !regForm.password ||
                                            !regForm.confirmPassword
                                        }
                                    >
                                        {loading ? "Creating account..." : "Create Account"}
                                    </Button>
                                    <p className="text-sm text-muted-foreground text-center font-medium">
                                        Already have an account?{" "}
                                        <button
                                            type="button"
                                            onClick={toggleMode}
                                            className="text-primary hover:text-accent font-bold transition-colors"
                                        >
                                            Sign in
                                        </button>
                                    </p>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
