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

export type OrderTimelineStep = {
  key: string;
  label: string;
  description: string;
  order: number;
  state: "completed" | "current" | "upcoming";
  at?: string | null;
};

export type OrderHistoryItem = {
  stageKey: string;
  stageLabel: string;
  note?: string;
  at: string;
};

export type CustomerTrackedOrder = {
  _id: string;
  id?: string;
  reference: string;
  vehicle: {
    _id?: string;
    title?: string;
    brand?: string;
    model?: string;
    year?: number;
    colour?: string;
    vin?: string;
    image?: string;
  };
  agreedPrice: {
    amount: number;
    currency: string;
  };
  status: "ACTIVE" | "COMPLETED" | "CANCELLED" | string;
  currentStage: {
    key: string;
    label: string;
  };
  estimatedDeliveryDate?: string | null;
  deliveryAddress?: string | null;
  history?: OrderHistoryItem[];
  timeline?: OrderTimelineStep[];
  createdAt: string;
  updatedAt: string;
};

export type OrdersListResponse = {
  items: CustomerTrackedOrder[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
};

/**
 * List customer vehicle orders
 * GET /orders
 */
export async function fetchCustomerOrders(
  status?: string,
): Promise<OrdersListResponse> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const res = await fetch(`${apiBase()}/orders${query}`, {
    headers: {
      Accept: "application/json",
      ...getAuthHeader(),
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const json = (await res.json()) as { data?: OrdersListResponse } & OrdersListResponse;
  return json.data ?? json;
}

/**
 * Track single vehicle order with timeline and stage progress
 * GET /orders/:id
 */
export async function fetchCustomerOrderTrack(
  id: string,
): Promise<CustomerTrackedOrder | null> {
  const res = await fetch(`${apiBase()}/orders/${encodeURIComponent(id)}`, {
    headers: {
      Accept: "application/json",
      ...getAuthHeader(),
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = (await res.json()) as { data?: CustomerTrackedOrder } & CustomerTrackedOrder;
  return json.data ?? json;
}
