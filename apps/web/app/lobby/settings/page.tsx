"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import SettingsNav from "./components/settings-nav";
import UploadAvatar from "./components/upload-avatar";

interface Profile {
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  bio: string | null;
  avatarUrl: string | null;
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

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
          setAvatarUrl(p.avatarUrl || null);
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
          avatarUrl: avatarUrl || undefined,
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
      <div className="flex items-center justify-center h-full text-primary">
        <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden animate-in fade-in duration-500">
      {/* Left Navigation Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0 z-20 border-b md:border-b-0 md:border-r border-white/10 dark:border-white/5 bg-background/50 md:bg-transparent backdrop-blur-md p-4 md:p-6 sticky top-0 md:relative">
        <div className="mb-6 md:mb-8 md:px-2">
          <h2 className="text-2xl font-black tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            Settings
          </h2>
          <p className="text-sm text-muted-foreground mt-1 hidden md:block">
            Manage your account preferences
          </p>
        </div>
        
        <SettingsNav />
      </aside>

      {/* Right Scrollable Content Area */}
      <div 
        id="settings-content-area" 
        className="flex-1 overflow-y-auto scroll-smooth relative"
      >
        <div className="max-w-3xl mx-auto py-8 md:py-12 px-4 sm:px-8 space-y-16">
          
          {/* SECION: PROFILE */}
          <section id="profile" className="scroll-mt-8 relative z-10 glass-card rounded-[2rem] p-8 sm:p-10 border border-white/10 dark:border-white/5 shadow-xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none group-hover:from-primary/10 transition-colors duration-500" />
            
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-6 text-foreground/90">Public Profile</h3>
              
              <div className="mb-8 p-6 glass-card rounded-2xl border border-white/5 bg-background/20 dark:bg-background/40">
                <UploadAvatar
                  name={displayName || "WildCat"}
                  currentUrl={avatarUrl}
                  onUploadSuccess={(url) => setAvatarUrl(url)}
                />
              </div>

              <form onSubmit={handleSave} className="space-y-6 text-foreground">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="font-semibold text-foreground/80">Display Name *</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    placeholder="How others will see you"
                    className="bg-white/5 dark:bg-black/20 border-white/10 dark:border-white/5 focus-visible:ring-primary/50 rounded-xl h-12"
                  />
                  <p className="text-xs text-muted-foreground ml-1">You can change this once every 30 days.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="font-semibold text-foreground/80">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Juan"
                      className="bg-white/5 dark:bg-black/20 border-white/10 dark:border-white/5 focus-visible:ring-primary/50 rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="font-semibold text-foreground/80">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Dela Cruz"
                      className="bg-white/5 dark:bg-black/20 border-white/10 dark:border-white/5 focus-visible:ring-primary/50 rounded-xl h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="font-semibold text-foreground/80">Bio</Label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={200}
                    rows={4}
                    placeholder="Tell others about yourself..."
                    className="flex w-full rounded-xl border border-white/10 dark:border-white/5 bg-white/5 dark:bg-black/20 px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 resize-none transition-colors shadow-inner"
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-right font-medium">
                    {bio.length}/200
                  </p>
                </div>

                <div className="pt-2">
                  {error && (
                    <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2">
                      <span className="text-lg">⚠️</span> {error}
                    </div>
                  )}
                  {success && (
                    <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-2">
                      <span className="text-lg">✅</span> Profile updated successfully!
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={saving || !displayName.trim()}
                    className="w-full sm:w-auto h-12 px-8 rounded-full shadow-lg hover:shadow-primary/25 bg-gradient-to-r from-primary to-accent text-white font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {saving ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Saving...
                      </div>
                    ) : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </section>

          {/* SECION: ACCOUNT */}
          <section id="account" className="scroll-mt-8 relative z-10 glass-card rounded-[2rem] p-8 sm:p-10 border border-white/10 dark:border-white/5 shadow-xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none group-hover:from-accent/10 transition-colors duration-500 rounded-[2rem]" />
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-6 text-foreground/90">Account Information</h3>
            
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-semibold text-foreground/80">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09XX XXX XXXX"
                    className="bg-white/5 dark:bg-black/20 border-white/10 dark:border-white/5 focus-visible:ring-accent/50 rounded-xl h-12"
                  />
                  <p className="text-xs text-muted-foreground ml-1">For account recovery purposes.</p>
                </div>
                
                <div className="space-y-2">
                   <Label className="font-semibold text-foreground/80">Danger Zone</Label>
                   <div className="p-4 sm:p-6 rounded-2xl border border-destructive/20 bg-destructive/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                     <div>
                       <h4 className="font-bold text-destructive">Sign Out of WildChat</h4>
                       <p className="text-sm text-foreground/70 mt-1">
                         This will clear your active session on this device.
                       </p>
                     </div>
                     <Button 
                       variant="destructive" 
                       onClick={() => signOut({ callbackUrl: "/" })}
                       className="rounded-full shadow-lg hover:shadow-destructive/25 flex-shrink-0"
                     >
                       <LogOut className="w-4 h-4 mr-2" />
                       Sign Out
                     </Button>
                   </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECION: NOTIFICATIONS */}
          <section id="notifications" className="scroll-mt-8 relative z-10 glass-card rounded-[2rem] p-8 sm:p-10 border border-white/10 dark:border-white/5 shadow-xl">
             <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2 text-foreground/90">Notifications</h3>
              <p className="text-muted-foreground text-sm mb-6">Choose how we contact you.</p>

              <div className="flex items-center justify-between p-4 rounded-xl glass-card bg-white/5 mb-4">
                <div>
                  <h4 className="font-medium text-foreground">Push Notifications</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Receive immediate ding alerts for new messages.</p>
                </div>
                {/* Visual toggle only for UI polish */}
                <div className="w-11 h-6 bg-primary rounded-full relative cursor-pointer shadow-inner">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl glass-card bg-white/5">
                <div>
                  <h4 className="font-medium text-foreground">Email Digests</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Receive weekly summaries of unread conversations.</p>
                </div>
                {/* Visual toggle only for UI polish */}
                <div className="w-11 h-6 bg-muted rounded-full relative cursor-pointer shadow-inner">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                </div>
              </div>
            </div>
          </section>

          {/* SECION: PRIVACY */}
          <section id="privacy" className="scroll-mt-8 relative z-10 glass-card rounded-[2rem] p-8 sm:p-10 border border-white/10 dark:border-white/5 shadow-xl flex items-center justify-center flex-col text-center min-h-[300px]">
            <div className="w-16 h-16 rounded-full bg-accent/20 text-accent flex items-center justify-center mb-4">
              <span className="text-3xl">🔒</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">Privacy & Security</h3>
            <p className="text-muted-foreground max-w-sm">
              Your chats are strictly exclusive to the CIT-U network. E2E encryption is currently in development.
            </p>
          </section>

          <footer className="pb-12 text-center text-xs font-semibold text-muted-foreground/50 tracking-widest uppercase pb-24">
            WildChat Settings End
          </footer>
        </div>
      </div>
    </div>
  );
}

