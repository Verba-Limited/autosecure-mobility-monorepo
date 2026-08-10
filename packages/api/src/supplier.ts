import type { ApiClient } from "./client";
import type {
  CreateCarListingPayload,
  CreatePartListingPayload,
} from "./types";

export function createSupplierApi(client: ApiClient) {
  return {
    getProfile(accessToken: string) {
      return client.request("/suppliers/profile", { accessToken });
    },

    updateProfile(
      accessToken: string,
      payload: { firstName: string; lastName: string; companyName: string },
    ) {
      return client.request("/suppliers/profile", {
        method: "PUT",
        accessToken,
        body: payload,
      });
    },

    uploadAvatar(accessToken: string, formData: FormData) {
      return client.request("/suppliers/profile/avatar", {
        method: "POST",
        accessToken,
        body: formData,
      });
    },

    getListings(accessToken: string, page = 1, limit = 10) {
      return client.request(`/inventory?page=${page}&limit=${limit}`, {
        accessToken,
      });
    },

    getDashboard(accessToken: string) {
      return client.request("/inventory/dashboard", { accessToken });
    },

    createCarListing(accessToken: string, payload: CreateCarListingPayload) {
      return client.request("/inventory/cars", {
        method: "POST",
        accessToken,
        body: payload,
      });
    },

    createPartListing(accessToken: string, payload: CreatePartListingPayload) {
      return client.request("/inventory/parts", {
        method: "POST",
        accessToken,
        body: payload,
      });
    },

    updateListing(accessToken: string, id: string, payload: unknown) {
      return client.request(`/inventory/${id}`, {
        method: "PUT",
        accessToken,
        body: payload,
      });
    },

    deleteListing(accessToken: string, id: string) {
      return client.request(`/inventory/${id}`, {
        method: "DELETE",
        accessToken,
      });
    },

    uploadListingMedia(accessToken: string, id: string, files: File[]) {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      return client.request(`/inventory/${id}/media`, {
        method: "POST",
        accessToken,
        body: formData,
      });
    },

    submitListing(accessToken: string, id: string) {
      return client.request(`/inventory/${id}/submit`, {
        method: "POST",
        accessToken,
      });
    },
  };
}
