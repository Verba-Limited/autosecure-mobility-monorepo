"use client";

import {
  createAdminApi,
  createAdminApiClient,
  DEFAULT_ADMIN_API_URL,
} from "@autosecure/api";
import { useAdminAuthStore } from "@/stores/auth-store";

const apiUrl =
  process.env.NEXT_PUBLIC_AUTOSECURE_ADMIN_API_URL ?? DEFAULT_ADMIN_API_URL;

export const adminApi = createAdminApi(
  createAdminApiClient(apiUrl, () => {
    if (typeof window !== "undefined") {
      useAdminAuthStore.getState().logout();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login?expired=1";
      }
    }
  })
);

export function saveAdminTokens(tokens: unknown) {
  useAdminAuthStore.getState().setTokens(tokens);
}

export function getAdminErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "payload" in error &&
    typeof error.payload === "object" &&
    error.payload !== null &&
    "message" in error.payload
  ) {
    const message = error.payload.message;
    return Array.isArray(message) ? message.join(", ") : String(message);
  }

  return "The admin service could not complete that request.";
}
