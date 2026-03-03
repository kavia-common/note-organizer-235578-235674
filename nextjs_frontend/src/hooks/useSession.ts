"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { clearSession, getSessionToken, login, setSessionToken, signup } from "@/lib/api";

type SessionState =
  | { status: "loading"; token: string | null }
  | { status: "anonymous"; token: null }
  | { status: "authenticated"; token: string };

type AuthMode = "login" | "signup";

/**
 * PUBLIC_INTERFACE
 * Hook for handling session token persistence and basic auth operations.
 */
export function useSession() {
  const [state, setState] = useState<SessionState>({ status: "loading", token: null });

  useEffect(() => {
    const token = getSessionToken();
    if (token) setState({ status: "authenticated", token });
    else setState({ status: "anonymous", token: null });
  }, []);

  const isAuthed = state.status === "authenticated";

  const doLogout = useCallback(() => {
    clearSession();
    setState({ status: "anonymous", token: null });
  }, []);

  const doAuth = useCallback(
    async (mode: AuthMode, input: { emailOrUsername: string; password: string }) => {
      const isEmail = input.emailOrUsername.includes("@");
      const payload = isEmail
        ? { email: input.emailOrUsername, password: input.password }
        : { username: input.emailOrUsername, password: input.password };

      const res = mode === "login" ? await login(payload) : await signup(payload);

      if (res?.token) {
        setSessionToken(res.token);
        setState({ status: "authenticated", token: res.token });
      } else {
        // allow backend-less auth flows by still setting authenticated if a token already exists
        const token = getSessionToken();
        if (token) setState({ status: "authenticated", token });
      }
    },
    []
  );

  return useMemo(
    () => ({
      state,
      isAuthed,
      login: (input: { emailOrUsername: string; password: string }) => doAuth("login", input),
      signup: (input: { emailOrUsername: string; password: string }) => doAuth("signup", input),
      logout: doLogout,
    }),
    [state, isAuthed, doAuth, doLogout]
  );
}
