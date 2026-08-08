import type { ApiClient } from "./client";
import type { InquiryPayload } from "./types";

type CatalogQuery = Record<string, string | number | boolean | undefined>;

function toQueryString(query?: CatalogQuery) {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export function createCatalogApi(client: ApiClient) {
  return {
    getInventory(query?: CatalogQuery) {
      return client.request(`/inventory${toQueryString(query)}`);
    },

    getVehicles(query?: CatalogQuery) {
      return client.request(`/catalog/vehicles${toQueryString(query)}`);
    },

    getVehicle(id: string) {
      return client.request(`/catalog/vehicles/${id}`);
    },

    inquireVehicle(id: string, payload: InquiryPayload) {
      return client.request(`/catalog/vehicles/${id}/inquire`, {
        method: "POST",
        body: payload,
      });
    },

    getParts(query?: CatalogQuery) {
      return client.request(`/catalog/parts${toQueryString(query)}`);
    },

    getPart(id: string) {
      return client.request(`/catalog/parts/${id}`);
    },

    inquirePart(id: string, payload: InquiryPayload) {
      return client.request(`/catalog/parts/${id}/inquire`, {
        method: "POST",
        body: payload,
      });
    },

    getConfig() {
      return client.request("/catalog/config");
    },
  };
}