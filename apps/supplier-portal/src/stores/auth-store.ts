"use client";

import { create } from "zustand";

export const SUPPLIER_ACCESS_TOKEN_KEY = "autosecure_supplier_access_token";
export const SUPPLIER_REFRESH_TOKEN_KEY = "autosecure_supplier_refresh_token";

type SupplierAuthTokens = string | Record<string, unknown>;

type SupplierAuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  hasHydrated: boolean;
  hydrate: () => void;
  setTokens: (tokens: SupplierAuthTokens) => void;
  logout: (reason?: string) => void;
};

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function setAccessCookie(accessToken: string) {
  if (typeof document === "undefined") return;
  console.log("[AUTH DEBUG] Setting cookie autosecure_supplier_access_token");
  document.cookie = `${SUPPLIER_ACCESS_TOKEN_KEY}=${encodeURIComponent(
    accessToken,
  )}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

function clearAccessCookie() {
  if (typeof document === "undefined") return;
  console.log("[AUTH DEBUG] Clearing cookie autosecure_supplier_access_token");
  document.cookie = `${SUPPLIER_ACCESS_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

function getCookieValue(key: string) {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${key}=`));

  if (!match) {
    return null;
  }

  return decodeURIComponent(match.slice(key.length + 1));
}

export const useSupplierAuthStore = create<SupplierAuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  hasHydrated: false,

  hydrate: () => {
    if (typeof window === "undefined") return;
    const localAccess = localStorage.getItem(SUPPLIER_ACCESS_TOKEN_KEY);
    const cookieAccess = getCookieValue(SUPPLIER_ACCESS_TOKEN_KEY);
    const accessToken = localAccess ?? cookieAccess;
    const refreshToken = localStorage.getItem(SUPPLIER_REFRESH_TOKEN_KEY);

    console.log("[AUTH DEBUG] hydrate() called", {
      localAccess: localAccess ? `${localAccess.slice(0, 15)}...` : null,
      cookieAccess: cookieAccess ? `${cookieAccess.slice(0, 15)}...` : null,
      refreshToken: refreshToken ? `${refreshToken.slice(0, 15)}...` : null,
    });

    if (accessToken) {
      localStorage.setItem(SUPPLIER_ACCESS_TOKEN_KEY, accessToken);
      setAccessCookie(accessToken);
    }

    set({
      accessToken,
      refreshToken,
      hasHydrated: true,
    });
  },

  setTokens: (rawTokens: SupplierAuthTokens) => {
    console.log("[AUTH DEBUG] RAW tokens received by setTokens:", rawTokens);
    if (!rawTokens) return;

    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    if (typeof rawTokens === "string") {
      accessToken = rawTokens;
    } else if (typeof rawTokens === "object" && rawTokens !== null) {
      const candidates = [
        rawTokens,
        rawTokens.data,
        rawTokens.tokens,
        rawTokens.result,
        rawTokens.payload,
      ];

      for (const obj of candidates) {
        if (!obj || typeof obj !== "object") continue;

        const record = obj as Record<string, unknown>;

        if (!accessToken) {
          const candidate =
            record.accessToken ??
            record.access_token ??
            record.token ??
            record.jwt ??
            record.bearer ??
            null;
          accessToken = typeof candidate === "string" ? candidate : null;
        }

        if (!refreshToken) {
          const candidate =
            record.refreshToken ??
            record.refresh_token ??
            record.refreshTokenKey ??
            null;
          refreshToken = typeof candidate === "string" ? candidate : null;
        }

        if (accessToken) break;
      }
    }

    console.log("[AUTH DEBUG] setTokens() successfully parsed:", {
      accessToken: accessToken ? `${accessToken.slice(0, 15)}...` : null,
      refreshToken: refreshToken ? `${refreshToken.slice(0, 15)}...` : null,
    });

    if (accessToken && typeof window !== "undefined") {
      localStorage.setItem(SUPPLIER_ACCESS_TOKEN_KEY, accessToken);
      if (refreshToken) {
        localStorage.setItem(SUPPLIER_REFRESH_TOKEN_KEY, refreshToken);
      }
      setAccessCookie(accessToken);
    }

    set({
      accessToken: accessToken ?? null,
      refreshToken: refreshToken ?? null,
      hasHydrated: true,
    });
  },

  logout: (reason = "unspecified") => {
    console.warn(`[AUTH DEBUG] logout() TRIGGERED! Reason: ${reason}`);
    if (typeof window !== "undefined") {
      localStorage.removeItem(SUPPLIER_ACCESS_TOKEN_KEY);
      localStorage.removeItem(SUPPLIER_REFRESH_TOKEN_KEY);
      clearAccessCookie();
    }
    set({
      accessToken: null,
      refreshToken: null,
      hasHydrated: true,
    });
  },
}));

export function hydrateSupplierAuthStore() {
  useSupplierAuthStore.getState().hydrate();
}
