"use client";

import { signOut } from "next-auth/react";
import { PawPrint, LogOut, Clock } from "lucide-react";
import Link from "next/link";

export default function PendingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none" />

      <div className="w-full max-w-md glass-card rounded-[2rem] p-8 shadow-2xl relative z-10 text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center ring-2 ring-amber-500/20 shadow-inner">
          <Clock className="w-12 h-12 text-amber-500" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-foreground">
            Account Pending Approval
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
            Your WildChat account has been created and is currently awaiting
            approval by a CIT-U administrator. You&apos;ll be able to access the
            platform once your registration is reviewed.
          </p>
        </div>

        {/* Info card */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-left space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <PawPrint className="w-4 h-4 text-primary" />
            What happens next?
          </div>
          <ul className="text-xs text-muted-foreground space-y-1.5 ml-6 list-disc">
            <li>A CIT-U administrator will review your registration</li>
            <li>Once approved, you can log in and complete your profile</li>
            <li>You&apos;ll have full access to WildChat features</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <Link
            href="/auth"
            className="text-sm text-primary font-bold hover:underline"
          >
            Try signing in again
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}
