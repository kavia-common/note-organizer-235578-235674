"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Props = {
  onLogin: (input: { emailOrUsername: string; password: string }) => Promise<void>;
  onSignup: (input: { emailOrUsername: string; password: string }) => Promise<void>;
};

type Mode = "login" | "signup";

/**
 * PUBLIC_INTERFACE
 * Authentication card (login/signup) with retro styling.
 */
export function AuthCard({ onLogin, onSignup }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => (mode === "login" ? "Insert Disk: Login" : "New Player: Sign Up"), [mode]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!emailOrUsername.trim()) {
      setError("Please enter your email or username.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "login") await onLogin({ emailOrUsername, password });
      else await onSignup({ emailOrUsername, password });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed.";
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="w-full max-w-md rounded-lg border-2 border-black bg-[var(--surface)] p-5 shadow-[6px_6px_0_0_#000]">
      <header className="mb-4">
        <div className="text-xs font-semibold opacity-80">NOTE-ORGANIZER // RETRO EDITION</div>
        <h1 className="mt-1 text-xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm opacity-80">
          Auth uses the backend API. Your session token is stored locally in your browser.
        </p>
      </header>

      <form className="space-y-3" onSubmit={submit}>
        <Input
          label="Email or Username"
          placeholder="you@example.com or handle"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          autoComplete="username"
        />
        <Input
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />

        {error ? (
          <div role="alert" className="rounded-md border-2 border-black bg-[var(--danger)] px-3 py-2 text-sm font-semibold">
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-2">
          <Button type="submit" disabled={busy}>
            {busy ? "Working..." : mode === "login" ? "Login" : "Create Account"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}
          >
            {mode === "login" ? "Need an account?" : "Have an account?"}
          </Button>
        </div>
      </form>
    </section>
  );
}
