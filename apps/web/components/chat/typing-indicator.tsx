"use client";

import { useEffect, useState } from "react";

export default function TypingIndicator({ name }: { name: string }) {
  const [dots, setDots] = useState("");

  // A subtle text animation as fallback or complement
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-4 py-2 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-muted px-3 py-2 rounded-2xl rounded-bl-sm flex items-center gap-1.5 w-max">
        <div
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <span className="text-xs text-muted-foreground italic">
        {name} is typing{dots}
      </span>
    </div>
  );
}
