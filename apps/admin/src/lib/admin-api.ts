"use client";

import {
  ApiError,
  createAdminApi,
  createAdminApiClient,
  DEFAULT_ADMIN_API_URL,
  type ApiErrorBody,
} from "@autosecure/api";
import { useAdminAuthStore } from "@/stores/auth-store";

const apiUrl =
  process.env.NEXT_PUBLIC_AUTOSECURE_ADMIN_API_URL ?? DEFAULT_ADMIN_API_URL;

const refreshApi = createAdminApi(createAdminApiClient(apiUrl));

function expireAdminSession() {
  if (typeof window === "undefined") return;
  useAdminAuthStore.getState().logout();
  if (!window.location.pathname.startsWith("/login")) {
    const returnTo = `${window.location.pathname}${window.location.search}`;
    const loginUrl = new URL("/login", window.location.origin);
    loginUrl.searchParams.set("expired", "1");
    loginUrl.searchParams.set("returnTo", returnTo);
    window.location.replace(loginUrl.toString());
  }
}

export const adminApi = createAdminApi(
  createAdminApiClient(apiUrl, {
    onUnauthorized: expireAdminSession,
    refreshAccessToken: async () => {
      const refreshToken = useAdminAuthStore.getState().refreshToken;
      if (!refreshToken) return null;
      const response = await refreshApi.refresh(refreshToken);
      saveAdminTokens(response);
      return useAdminAuthStore.getState().accessToken;
    },
  }),
);

export function saveAdminTokens(tokens: unknown) {
  useAdminAuthStore.getState().setTokens(tokens);
}

export function getAdminErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const payload = error.payload as ApiErrorBody | string | undefined;
    if (typeof payload === "string") {
      if (payload.trim()) return payload;
    } else {
      const message = payload?.message;
      if (Array.isArray(message)) return message.join(", ");
      if (typeof message === "string" && message.trim()) return message;
    }
  }

  if (error instanceof Error && error.message) return error.message;

  return "The admin service could not complete that request.";
}
