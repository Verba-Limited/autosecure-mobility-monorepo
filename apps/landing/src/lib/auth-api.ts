"use client";

import {
  createAuthApi,
  createPublicApiClient,
  DEFAULT_PUBLIC_API_URL,
} from "@autosecure/api";
import type { RegisterCustomerPayload } from "@autosecure/api";

export const CUSTOMER_EMAIL_KEY = "autosecure_customer_email";
export const CUSTOMER_ACCESS_TOKEN_KEY = "autosecure_customer_access_token";
export const CUSTOMER_REFRESH_TOKEN_KEY = "autosecure_customer_refresh_token";

const publicApiUrl =
  process.env.NEXT_PUBLIC_AUTOSECURE_PUBLIC_API_URL ?? DEFAULT_PUBLIC_API_URL;

export const authApi = createAuthApi(createPublicApiClient(publicApiUrl));

export type CustomerRegistrationPayload = RegisterCustomerPayload & {
  companyName: string;
};

export function saveCustomerSession(
  email: string,
  rawTokens: unknown,
) {
  const tokens = extractTokens(rawTokens);
  localStorage.setItem(CUSTOMER_EMAIL_KEY, email);
  if (tokens.accessToken) {
    localStorage.setItem(CUSTOMER_ACCESS_TOKEN_KEY, tokens.accessToken);
  }
  if (tokens.refreshToken) {
    localStorage.setItem(CUSTOMER_REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
}

export function getCustomerEmail() {
  return typeof window === "undefined"
    ? null
    : localStorage.getItem(CUSTOMER_EMAIL_KEY);
}

export function clearCustomerSession() {
  localStorage.removeItem(CUSTOMER_EMAIL_KEY);
  localStorage.removeItem(CUSTOMER_ACCESS_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_REFRESH_TOKEN_KEY);
}

function extractTokens(rawTokens: unknown) {
  const candidates = [
    rawTokens,
    typeof rawTokens === "object" && rawTokens !== null && "data" in rawTokens
      ? rawTokens.data
      : null,
  ];
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") continue;
    const value = candidate as Record<string, unknown>;
    const accessToken = value.accessToken ?? value.access_token ?? value.token;
    const refreshToken = value.refreshToken ?? value.refresh_token;
    if (typeof accessToken === "string" || typeof refreshToken === "string") {
      return {
        accessToken: typeof accessToken === "string" ? accessToken : null,
        refreshToken: typeof refreshToken === "string" ? refreshToken : null,
      };
    }
  }
  return { accessToken: null, refreshToken: null };
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
