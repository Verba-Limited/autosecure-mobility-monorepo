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

    getListings(accessToken: string, status?: string, page = 1, limit = 10) {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      const query = `?${params.toString()}`;
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

    // Contact messages
    getContactMessages(accessToken: string, page = 1, limit = 10) {
      return client.request(
        `/admin/contact-messages?page=${page}&limit=${limit}`,
        {
          accessToken,
        },
      );
    },

    getContactMessagesStats(accessToken: string) {
      return client.request(`/admin/contact-messages/stats`, { accessToken });
    },

    getContactMessage(accessToken: string, id: string) {
      return client.request(`/admin/contact-messages/${id}`, { accessToken });
    },

    updateContactMessageStatus(
      accessToken: string,
      id: string,
      status: string,
    ) {
      return client.request(`/admin/contact-messages/${id}/status`, {
        method: "PATCH",
        accessToken,
        body: { status },
      });
    },

    // ─── Section 17: Dynamic Filters & Attributes ─────────────────────────
    getAttributes(accessToken: string, query?: { group?: string; filterable?: boolean; scope?: string }) {
      const params = new URLSearchParams();
      if (query?.group) params.set("group", query.group);
      if (query?.filterable !== undefined) params.set("filterable", String(query.filterable));
      if (query?.scope) params.set("scope", query.scope);
      const qs = params.toString() ? `?${params.toString()}` : "";
      return client.request(`/admin/attributes${qs}`, { accessToken });
    },

    createAttribute(accessToken: string, payload: Record<string, unknown>) {
      return client.request("/admin/attributes", {
        method: "POST",
        accessToken,
        body: payload,
      });
    },

    getAttribute(accessToken: string, id: string) {
      return client.request(`/admin/attributes/${id}`, { accessToken });
    },

    updateAttribute(accessToken: string, id: string, payload: Record<string, unknown>) {
      return client.request(`/admin/attributes/${id}`, {
        method: "PATCH",
        accessToken,
        body: payload,
      });
    },

    deleteAttribute(accessToken: string, id: string) {
      return client.request(`/admin/attributes/${id}`, {
        method: "DELETE",
        accessToken,
      });
    },

    // ─── Section 16 & 18: Dynamic Vehicle Taxonomy & Categories ─────────────
    getTaxonomy(accessToken: string, query?: { kind?: string; parent?: string; isActive?: boolean; q?: string }) {
      const params = new URLSearchParams();
      if (query?.kind) params.set("kind", query.kind);
      if (query?.parent) params.set("parent", query.parent);
      if (query?.isActive !== undefined) params.set("isActive", String(query.isActive));
      if (query?.q) params.set("q", query.q);
      const qs = params.toString() ? `?${params.toString()}` : "";
      return client.request(`/admin/taxonomy${qs}`, { accessToken });
    },

    createTaxonomyTerm(accessToken: string, payload: { kind: string; name: string; slug?: string; parent?: string | null; order?: number; isActive?: boolean; metadata?: Record<string, unknown> }) {
      return client.request("/admin/taxonomy", {
        method: "POST",
        accessToken,
        body: payload,
      });
    },

    reorderTaxonomyTerms(accessToken: string, items: Array<{ id: string; order: number }>) {
      return client.request("/admin/taxonomy/reorder", {
        method: "PATCH",
        accessToken,
        body: items,
      });
    },

    getTaxonomyTerm(accessToken: string, id: string) {
      return client.request(`/admin/taxonomy/${id}`, { accessToken });
    },

    updateTaxonomyTerm(accessToken: string, id: string, payload: Record<string, unknown>) {
      return client.request(`/admin/taxonomy/${id}`, {
        method: "PATCH",
        accessToken,
        body: payload,
      });
    },

    deleteTaxonomyTerm(accessToken: string, id: string) {
      return client.request(`/admin/taxonomy/${id}`, {
        method: "DELETE",
        accessToken,
      });
    },

    // ─── Section 18: Scalable Vehicle Trims & Specs Database ───────────────
    getTrims(accessToken: string, query?: { brandSlug?: string; modelSlug?: string; year?: number | string; q?: string; hasUnverified?: boolean; status?: string; page?: number; limit?: number }) {
      const params = new URLSearchParams();
      if (query) {
        for (const [key, val] of Object.entries(query)) {
          if (val !== undefined && val !== null && val !== "") params.set(key, String(val));
        }
      }
      const qs = params.toString() ? `?${params.toString()}` : "";
      return client.request(`/admin/trims${qs}`, { accessToken });
    },

    createTrim(accessToken: string, payload: Record<string, unknown>) {
      return client.request("/admin/trims", {
        method: "POST",
        accessToken,
        body: payload,
      });
    },

    getTrim(accessToken: string, id: string) {
      return client.request(`/admin/trims/${id}`, { accessToken });
    },

    updateTrim(accessToken: string, id: string, payload: Record<string, unknown>) {
      return client.request(`/admin/trims/${id}`, {
        method: "PATCH",
        accessToken,
        body: payload,
      });
    },

    deleteTrim(accessToken: string, id: string) {
      return client.request(`/admin/trims/${id}`, {
        method: "DELETE",
        accessToken,
      });
    },

    verifyTrimSections(accessToken: string, id: string, payload: { sections: string[] | "all"; note?: string }) {
      return client.request(`/admin/trims/${id}/verify`, {
        method: "POST",
        accessToken,
        body: payload,
      });
    },

    publishTrim(accessToken: string, id: string) {
      return client.request(`/admin/trims/${id}/publish`, {
        method: "POST",
        accessToken,
      });
    },

    unpublishTrim(accessToken: string, id: string) {
      return client.request(`/admin/trims/${id}/unpublish`, {
        method: "POST",
        accessToken,
      });
    },

    archiveTrim(accessToken: string, id: string) {
      return client.request(`/admin/trims/${id}/archive`, {
        method: "POST",
        accessToken,
      });
    },

    duplicateTrim(accessToken: string, id: string, payload?: { year?: number; name?: string }) {
      return client.request(`/admin/trims/${id}/duplicate`, {
        method: "POST",
        accessToken,
        body: payload ?? {},
      });
    },
  };
}

