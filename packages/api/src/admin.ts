import type { ApiClient } from "./client";
import type {
  AuthTokens,
  ConfigItemPayload,
  LoginPayload,
  RejectListingPayload,
} from "./types";

export function createAdminApi(client: ApiClient) {
  return {
    login(payload: LoginPayload) {
      return client.request<AuthTokens>("/admin/auth/login", {
        method: "POST",
        body: payload,
      });
    },

    refresh(refreshToken: string) {
      return client.request<AuthTokens>("/admin/auth/refresh", {
        method: "POST",
        body: { refreshToken },
      });
    },

    getDashboard(accessToken: string) {
      return client.request("/admin/dashboard", { accessToken });
    },

    getReports(accessToken: string) {
      return client.request("/admin/dashboard/reports", { accessToken });
    },

    getSuppliers(accessToken: string, page = 1, limit = 10) {
      return client.request(`/admin/suppliers?page=${page}&limit=${limit}`, {
        accessToken,
      });
    },

    updateSupplierStatus(accessToken: string, id: string, status: string) {
      return client.request(`/admin/suppliers/${id}/status`, {
        method: "PATCH",
        accessToken,
        body: { status },
      });
    },

    getListings(accessToken: string, status?: string) {
      const query = status ? `?status=${encodeURIComponent(status)}` : "";
      return client.request(`/admin/listings${query}`, { accessToken });
    },

    approveListing(accessToken: string, id: string) {
      return client.request(`/admin/listings/${id}/approve`, {
        method: "PATCH",
        accessToken,
      });
    },

    rejectListing(
      accessToken: string,
      id: string,
      payload: RejectListingPayload,
    ) {
      return client.request(`/admin/listings/${id}/reject`, {
        method: "PATCH",
        accessToken,
        body: payload,
      });
    },

    getConfig(accessToken: string) {
      return client.request("/admin/config", { accessToken });
    },

    createConfig(accessToken: string, payload: ConfigItemPayload) {
      return client.request("/admin/config", {
        method: "POST",
        accessToken,
        body: payload,
      });
    },

    updateConfig(accessToken: string, id: string, payload: ConfigItemPayload) {
      return client.request(`/admin/config/${id}`, {
        method: "PUT",
        accessToken,
        body: payload,
      });
    },

    deleteConfig(accessToken: string, id: string) {
      return client.request(`/admin/config/${id}`, {
        method: "DELETE",
        accessToken,
      });
    },
  };
}
