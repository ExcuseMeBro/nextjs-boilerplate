"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AuthSession, LoginPayload } from "./types";

type AuthContextValue = AuthSession & {
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  reload: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function readSession(): Promise<AuthSession> {
  const response = await fetch("/api/auth/me", {
    cache: "no-store",
    credentials: "include",
  });

  if (response.status === 401) {
    return { authenticated: false, user: null };
  }

  if (!response.ok) {
    throw new Error("Failed to load auth session.");
  }

  return response.json();
}

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [session, setSession] = useState<AuthSession>({ authenticated: false, user: null });
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);

    try {
      setSession(await readSession());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload().catch(() => {
      setSession({ authenticated: false, user: null });
      setLoading(false);
    });
  }, [reload]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Login failed.");
      }

      await reload();
    },
    [reload],
  );

  const logout = useCallback(async () => {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Logout failed.");
    }

    setSession({ authenticated: false, user: null });
  }, []);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Refresh failed.");
    }

    await reload();
  }, [reload]);

  const value = useMemo(
    () => ({ ...session, loading, login, logout, refresh, reload }),
    [loading, login, logout, refresh, reload, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
