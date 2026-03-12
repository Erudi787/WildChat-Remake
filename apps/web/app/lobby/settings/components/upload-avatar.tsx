"use client";

import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";

interface UploadAvatarProps {
  currentUrl: string | null;
  name: string;
  onUploadSuccess: (url: string) => void;
}

export default function UploadAvatar({ currentUrl, name, onUploadSuccess }: UploadAvatarProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    // Validate type
    if (!file.type.startsWith("image/")) {
      setError("File must be an image");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to upload image");
      }

      const { url } = await res.json();
      onUploadSuccess(url);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col items-center sm:items-start gap-4">
      <div className="relative group">
        {/* Avatar Display */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-white/10 dark:ring-white/5 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-xl relative z-10">
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          ) : currentUrl ? (
            <img 
              src={currentUrl} 
              alt={name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
              {getInitials(name)}
            </span>
          )}
        </div>

        {/* Hover Overlay */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 z-20 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer disabled:cursor-not-allowed disabled:group-hover:opacity-0"
        >
          <Camera className="w-8 h-8 mb-1" />
          <span className="text-xs font-medium">Change</span>
        </button>

        {/* Hidden Input field */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg, image/png, image/webp"
          className="hidden"
        />
      </div>

      {error && (
        <p className="text-destructive text-sm font-medium mt-2">{error}</p>
      )}
      
      <div className="text-center sm:text-left space-y-1">
        <h3 className="font-semibold text-lg text-foreground">{name}</h3>
        <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Max 5MB.</p>
      </div>
    </div>
  );
}
