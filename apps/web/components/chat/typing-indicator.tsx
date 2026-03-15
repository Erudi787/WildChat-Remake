"use client";

export default function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="px-4 py-2 flex items-center gap-2.5 border-t border-white/5 bg-background/50">
      <div className="bg-muted/80 px-4 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-1 w-max shadow-sm">
        <span
          className="block w-2 h-2 rounded-full bg-muted-foreground/60 animate-[typing-bounce_1.4s_ease-in-out_infinite]"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="block w-2 h-2 rounded-full bg-muted-foreground/60 animate-[typing-bounce_1.4s_ease-in-out_infinite]"
          style={{ animationDelay: "200ms" }}
        />
        <span
          className="block w-2 h-2 rounded-full bg-muted-foreground/60 animate-[typing-bounce_1.4s_ease-in-out_infinite]"
          style={{ animationDelay: "400ms" }}
        />
      </div>
      <span className="text-xs text-muted-foreground font-medium">
        {name} is typing
      </span>
    </div>
  );
}
