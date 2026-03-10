"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AccountSettingsPage() {
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (confirmText !== "DELETE") {
      setError('Please type "DELETE" to confirm');
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete account");
        setDeleting(false);
        return;
      }

      // Sign out and redirect to home
      await signOut({ callbackUrl: "/" });
    } catch {
      setError("An unexpected error occurred");
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h2 className="text-2xl font-bold mb-1">Account</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Manage your WildChat account.
      </p>

      {/* Danger Zone */}
      <div className="border border-destructive/30 rounded-lg p-5">
        <h3 className="text-lg font-semibold text-destructive mb-2">
          Danger Zone
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Deleting your account is permanent and cannot be undone. All your
          messages, conversations, and profile data will be permanently removed.
        </p>

        {!showConfirm ? (
          <Button
            variant="destructive"
            onClick={() => setShowConfirm(true)}
          >
            Delete My Account
          </Button>
        ) : (
          <form onSubmit={handleDelete} className="space-y-4">
            <div>
              <Label htmlFor="password">Confirm Your Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>

            <div>
              <Label htmlFor="confirmText">
                Type <span className="font-mono font-bold">DELETE</span> to
                confirm
              </Label>
              <Input
                id="confirmText"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                required
                placeholder='Type "DELETE"'
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowConfirm(false);
                  setPassword("");
                  setConfirmText("");
                  setError("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={deleting || !password || confirmText !== "DELETE"}
              >
                {deleting ? "Deleting..." : "Permanently Delete Account"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
