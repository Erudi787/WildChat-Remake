"use client";

import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";

interface UploadAvatarProps {
  currentUrl: string | null;
  previewUrl: string | null;
  name: string;
  uploading?: boolean;
  onFileSelected: (file: File, previewUrl: string) => void;
}

/**
 * Resize an image file to a max dimension and return as a JPEG Blob + data URL.
 * This keeps avatar data small enough to store in the database.
 */
function resizeImage(file: File, maxSize = 256): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > height) {
        if (width > maxSize) { height = (height * maxSize) / width; width = maxSize; }
      } else {
        if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Failed to compress image"));
          const reader = new FileReader();
          reader.onloadend = () => resolve({ blob, dataUrl: reader.result as string });
          reader.readAsDataURL(blob);
        },
        "image/jpeg",
        0.85
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
    img.src = url;
  });
}

export default function UploadAvatar({ currentUrl, previewUrl, name, uploading, onFileSelected }: UploadAvatarProps) {
  const [error, setError] = useState("");
  const [resizing, setResizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayUrl = previewUrl || currentUrl;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB before resize)
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
    setResizing(true);

    try {
      // Resize to 256x256 and get both blob and data URL
      const { blob, dataUrl } = await resizeImage(file);
      // Create a new File from the resized blob for upload
      const resizedFile = new File([blob], file.name, { type: "image/jpeg" });
      onFileSelected(resizedFile, dataUrl);
    } catch (err: any) {
      setError(err.message || "Failed to process image");
    } finally {
      setResizing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isProcessing = uploading || resizing;

  return (
    <div className="flex flex-col items-center sm:items-start gap-4">
      <div className="relative group">
        {/* Avatar Display */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-white/10 dark:ring-white/5 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-xl relative z-10">
          {isProcessing ? (
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          ) : displayUrl ? (
            <img
              src={displayUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
              {getInitials(name)}
            </span>
          )}
        </div>

        {/* Preview badge */}
        {previewUrl && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-30 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
            Preview — save to apply
          </div>
        )}

        {/* Hover Overlay */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
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
