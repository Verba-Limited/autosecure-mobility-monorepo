"use client";

import { create } from "zustand";

export const ADMIN_ACCESS_TOKEN_KEY = "autosecure_admin_access_token";
export const ADMIN_REFRESH_TOKEN_KEY = "autosecure_admin_refresh_token";

type AdminAuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  hasHydrated: boolean;
  hydrate: () => void;
  setTokens: (tokens: unknown) => void;
  logout: () => void;
};

function findToken(value: unknown, keys: string[]): string | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  for (const key of keys) {
    if (typeof record[key] === "string") return record[key] as string;
  }
  for (const key of ["data", "tokens", "result", "payload"]) {
    const token = findToken(record[key], keys);
    if (token) return token;
  }
  return null;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  hasHydrated: false,
  hydrate: () => {
    if (typeof window === "undefined") return;
    set({
      accessToken: localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY),
      refreshToken: localStorage.getItem(ADMIN_REFRESH_TOKEN_KEY),
      hasHydrated: true,
    });
  },
  setTokens: (tokens) => {
    const accessToken =
      typeof tokens === "string"
        ? tokens
        : findToken(tokens, ["accessToken", "access_token", "token", "jwt"]);
    const refreshToken = findToken(tokens, ["refreshToken", "refresh_token"]);
    if (typeof window !== "undefined" && accessToken) {
      localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, accessToken);
      if (refreshToken)
        localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, refreshToken);
    }
    set({ accessToken, refreshToken, hasHydrated: true });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
      localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
    }
    set({ accessToken: null, refreshToken: null, hasHydrated: true });
  },
}));
