"use client";

import {
  ApiError,
  createPublicApiClient,
  createSupplierApi,
  DEFAULT_PUBLIC_API_URL,
  type CreateCarListingPayload,
  type CreatePartListingPayload,
} from "@autosecure/api";
import { authApi } from "@/lib/auth-api";
import {
  hydrateSupplierAuthStore,
  useSupplierAuthStore,
} from "@/stores/auth-store";

const publicApiUrl =
  process.env.NEXT_PUBLIC_AUTOSECURE_PUBLIC_API_URL ?? DEFAULT_PUBLIC_API_URL;

const supplierApi = createSupplierApi(createPublicApiClient(publicApiUrl));

async function withSupplierAuth<T>(
  request: (accessToken: string) => Promise<T>,
): Promise<T> {
  const {
    accessToken: initialAccessToken,
    refreshToken: initialRefreshToken,
    hasHydrated,
  } = useSupplierAuthStore.getState();
  let accessToken = initialAccessToken;
  let refreshToken = initialRefreshToken;

  console.log("[AUTH DEBUG] withSupplierAuth called", {
    hasAccessToken: Boolean(accessToken),
    hasRefreshToken: Boolean(refreshToken),
    hasHydrated,
  });

  if (!hasHydrated) {
    hydrateSupplierAuthStore();
    ({ accessToken, refreshToken } = useSupplierAuthStore.getState());
  }

  if (!accessToken) {
    hydrateSupplierAuthStore();
    ({ accessToken, refreshToken } = useSupplierAuthStore.getState());
  }

  if (!accessToken) {
    console.warn("[AUTH DEBUG] withSupplierAuth: accessToken is missing.");
    throw new Error("Supplier session is missing.");
  }

  try {
    return await request(accessToken);
  } catch (error) {
    console.warn("[AUTH DEBUG] withSupplierAuth: request caught error", error);

    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }

    if (!refreshToken) {
      console.warn(
        "[AUTH DEBUG] withSupplierAuth: ApiError 401 received and no refreshToken exists.",
      );
      throw error;
    }

    try {
      console.log(
        "[AUTH DEBUG] withSupplierAuth: ApiError 401 received, attempting refresh token...",
      );
      const tokens = await authApi.refresh(refreshToken);
      console.log(
        "[AUTH DEBUG] withSupplierAuth: refresh successful! Setting new tokens.",
      );
      const authStore = useSupplierAuthStore.getState();
      authStore.setTokens(tokens);
      const refreshedAccessToken = useSupplierAuthStore.getState().accessToken;

      if (!refreshedAccessToken) {
        throw new Error(
          "Supplier refresh response did not include an access token.",
        );
      }

      return await request(refreshedAccessToken);
    } catch (refreshError) {
      console.warn(
        "[AUTH DEBUG] withSupplierAuth: refresh failed, rethrowing error without forcing page reload.",
        refreshError,
      );
      throw refreshError;
    }
  }
}

export const supplierPortalApi = {
  getProfile() {
    return withSupplierAuth((token) => supplierApi.getProfile(token));
  },
  updateProfile(payload: {
    firstName: string;
    lastName: string;
    companyName: string;
  }) {
    return withSupplierAuth((token) =>
      supplierApi.updateProfile(token, payload),
    );
  },
  uploadAvatar(formData: FormData) {
    return withSupplierAuth((token) => supplierApi.uploadAvatar(token, formData));
  },
  getDashboard() {
    return withSupplierAuth((token) => supplierApi.getDashboard(token));
  },
  getListings(page = 1, limit = 10) {
    return withSupplierAuth((token) =>
      supplierApi.getListings(token, page, limit),
    );
  },
  createCarListing(payload: CreateCarListingPayload) {
    return withSupplierAuth((token) =>
      supplierApi.createCarListing(token, payload),
    );
  },
  createPartListing(payload: CreatePartListingPayload) {
    return withSupplierAuth((token) =>
      supplierApi.createPartListing(token, payload),
    );
  },
  updateListing(id: string, payload: unknown) {
    return withSupplierAuth((token) =>
      supplierApi.updateListing(token, id, payload),
    );
  },
  deleteListing(id: string) {
    return withSupplierAuth((token) => supplierApi.deleteListing(token, id));
  },
  uploadListingMedia(id: string, files: File[]) {
    return withSupplierAuth((token) =>
      supplierApi.uploadListingMedia(token, id, files),
    );
  },
  submitListing(id: string) {
    return withSupplierAuth((token) => supplierApi.submitListing(token, id));
  },
};
