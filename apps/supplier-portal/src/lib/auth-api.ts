"use client";

import {
  createAuthApi,
  createPublicApiClient,
  DEFAULT_PUBLIC_API_URL,
} from "@autosecure/api";
import { useSupplierAuthStore } from "@/stores/auth-store";

const publicApiUrl =
  process.env.NEXT_PUBLIC_AUTOSECURE_PUBLIC_API_URL ?? DEFAULT_PUBLIC_API_URL;

export const authApi = createAuthApi(createPublicApiClient(publicApiUrl));

export function saveSupplierTokens(tokens: {
  accessToken: string;
  refreshToken: string;
}) {
  useSupplierAuthStore.getState().setTokens(tokens);
}

export function clearSupplierTokens() {
  useSupplierAuthStore.getState().logout();
}

export function getAuthErrorMessage(error: unknown) {
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

  return "Something went wrong. Please try again.";
}
