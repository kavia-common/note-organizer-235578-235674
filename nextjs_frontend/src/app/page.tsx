"use client";

import React from "react";
import { AuthCard } from "@/components/AuthCard";
import { NotesApp } from "@/components/NotesApp";
import { useSession } from "@/hooks/useSession";

export default function Home() {
  const session = useSession();

  if (session.state.status === "loading") {
    return (
      <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
        <div className="rounded-lg border-2 border-black bg-[var(--surface)] p-5 shadow-[6px_6px_0_0_#000]">
          <div className="text-sm font-extrabold">Booting Note-OS...</div>
          <div className="mt-1 text-xs opacity-70">Checking local session token.</div>
        </div>
      </main>
    );
  }

  if (!session.isAuthed) {
    return (
      <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
        <AuthCard onLogin={session.login} onSignup={session.signup} />
      </main>
    );
  }

  return <NotesApp onLogout={session.logout} />;
}
