"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface ProfileData {
  name: string;
  avatarUrl: string | null;
}

interface ProfileContextValue {
  profile: ProfileData;
  updateProfile: (updates: Partial<ProfileData>) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({
  initialProfile,
  children,
}: {
  initialProfile: ProfileData;
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);

  const updateProfile = useCallback((updates: Partial<ProfileData>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
