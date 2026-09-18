"use client";

import { DEFAULT_PUBLIC_API_URL } from "@autosecure/api";
import { CUSTOMER_ACCESS_TOKEN_KEY } from "./auth-api";

function apiBase(): string {
  const env =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_AUTOSECURE_PUBLIC_API_URL
      : undefined;
  return (env ?? DEFAULT_PUBLIC_API_URL).replace(/\/+$/, "");
}

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem(CUSTOMER_ACCESS_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type UserProfile = {
  _id: string;
  email: string;
  role: "CUSTOMER" | "SUPPLIER" | "ADMIN" | string;
  isEmailVerified: boolean;
  firstName?: string;
  lastName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  favorites?: any[];
  notificationPreferences?: Record<string, boolean>;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateUserProfilePayload = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  notificationPreferences?: Record<string, boolean>;
};

/**
 * Get authenticated customer profile
 * GET /users/me
 */
export async function fetchUserProfile(): Promise<UserProfile> {
  const res = await fetch(`${apiBase()}/users/me`, {
    headers: {
      Accept: "application/json",
      ...getAuthHeader(),
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const json = (await res.json()) as { data?: UserProfile } & UserProfile;
  return json.data ?? json;
}

/**
 * Update authenticated customer profile
 * PATCH /users/me
 */
export async function updateUserProfile(
  payload: UpdateUserProfilePayload,
): Promise<UserProfile> {
  const res = await fetch(`${apiBase()}/users/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || `HTTP ${res.status}`);
  }

  const json = (await res.json()) as { data?: UserProfile } & UserProfile;
  return json.data ?? json;
}

/**
 * Upload customer profile avatar
 * POST /users/me/avatar
 */
export async function uploadUserAvatar(file: File): Promise<UserProfile> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${apiBase()}/users/me/avatar`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...getAuthHeader(),
    },
    body: formData,
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const json = (await res.json()) as { data?: UserProfile } & UserProfile;
  return json.data ?? json;
}

/**
 * Get customer saved favorites
 * GET /users/me/favorites
 */
export async function fetchUserFavorites(): Promise<any[]> {
  const res = await fetch(`${apiBase()}/users/me/favorites`, {
    headers: {
      Accept: "application/json",
      ...getAuthHeader(),
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const json = (await res.json()) as { data?: any[] } & any[];
  const data = json.data ?? json;
  return Array.isArray(data) ? data : [];
}
