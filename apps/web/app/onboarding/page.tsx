"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function OnboardingPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        displayName: "",
        firstName: "",
        lastName: "",
        phone: "",
        bio: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function updateField(field: string, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
        setError("");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!form.displayName.trim()) {
            setError("Display name is required");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/user/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to save profile");
                setLoading(false);
                return;
            }

            router.push("/lobby");
        } catch {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center p-4 gradient-subtle">
            <Card className="w-full max-w-lg shadow-xl border-0">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto mb-2">
                        <span className="text-4xl">🐱</span>
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        Welcome to WildChat!
                    </CardTitle>
                    <CardDescription>
                        Set up your profile so other Wildcats can find you.
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
                            <Label htmlFor="displayName">
                                Display Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="displayName"
                                type="text"
                                placeholder="How should others call you?"
                                value={form.displayName}
                                onChange={(e) => updateField("displayName", e.target.value)}
                                required
                                autoFocus
                            />
                            <p className="text-xs text-muted-foreground">
                                This is what other users will see.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    type="text"
                                    placeholder="Juan"
                                    value={form.firstName}
                                    onChange={(e) => updateField("firstName", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    type="text"
                                    placeholder="Dela Cruz"
                                    value={form.lastName}
                                    onChange={(e) => updateField("lastName", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+63 917 123 4567"
                                value={form.phone}
                                onChange={(e) => updateField("phone", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <textarea
                                id="bio"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                placeholder="Tell other Wildcats about yourself..."
                                value={form.bio}
                                onChange={(e) => updateField("bio", e.target.value)}
                                maxLength={200}
                            />
                            <p className="text-xs text-muted-foreground text-right">
                                {form.bio.length}/200
                            </p>
                        </div>
                    </CardContent>

                    <CardFooter>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading || !form.displayName.trim()}
                        >
                            {loading ? "Setting up your profile..." : "Continue to WildChat 🐾"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </main>
    );
}
