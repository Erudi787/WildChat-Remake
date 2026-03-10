"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Profile {
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  bio: string | null;
}

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/user/profile");
        const data = await res.json();
        if (data.profile) {
          const p = data.profile;
          setProfile(p);
          setDisplayName(p.displayName || "");
          setFirstName(p.firstName || "");
          setLastName(p.lastName || "");
          setPhone(p.phone || "");
          setBio(p.bio || "");
        }
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          phone: phone || undefined,
          bio: bio || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-muted-foreground text-sm">Loading profile...</div>
    );
  }

  return (
    <div className="max-w-lg">
      <h2 className="text-2xl font-bold mb-1">Edit Profile</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Update your display information visible to other Wildcats.
      </p>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <Label htmlFor="displayName">Display Name *</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            placeholder="How others will see you"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Juan"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Dela Cruz"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09XX XXX XXXX"
          />
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={200}
            rows={3}
            placeholder="Tell others about yourself..."
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {bio.length}/200
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
            ✅ Profile updated successfully!
          </p>
        )}

        <Button type="submit" disabled={saving || !displayName.trim()}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
