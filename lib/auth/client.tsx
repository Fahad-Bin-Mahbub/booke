"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/http";
import type { UserPublic } from "@/lib/types";

type AuthContextValue = {
  token: string | null;
  user: UserPublic | null;
  // Back-compat alias used across pages.
  profile: UserPublic | null;
  isReady: boolean;
  setToken: (token: string | null) => void;
  refreshProfile: () => Promise<void>;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setTokenState] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<UserPublic | null>(null);
  const [isReady, setIsReady] = React.useState(false);

  const setToken = React.useCallback((t: string | null) => {
    setTokenState(t);
    if (typeof window === "undefined") return;
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
  }, []);

  const refreshProfile = React.useCallback(async () => {
    const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!t) {
      setUser(null);
      setTokenState(null);
      return;
    }
    try {
      const data = await apiFetch<UserPublic>("/api/user/profile", { token: t });
      setUser(data);
      setTokenState(t);
    } catch {
      setUser(null);
      setToken(null);
    }
  }, [setToken]);

  const logout = React.useCallback(() => {
    setUser(null);
    setToken(null);
    toast.message("Logged out");
    router.push("/login");
  }, [router, setToken]);

  React.useEffect(() => {
    const t = localStorage.getItem("token");
    setTokenState(t);
    setIsReady(true);
    void refreshProfile();
  }, [refreshProfile]);

  const value: AuthContextValue = {
    token,
    user,
    profile: user,
    isReady,
    setToken,
    refreshProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider />");
  return ctx;
}
