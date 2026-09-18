"use client";

import {
  type AcceptQuotePayload,
  type CreateQuotePayload,
  type CustomerQuote,
  type CustomerQuotesListResponse,
  type DeclineQuotePayload,
  type QuotesQuery,
  DEFAULT_PUBLIC_API_URL,
} from "@autosecure/api";

export type {
  AcceptQuotePayload,
  CreateQuotePayload,
  CustomerQuote,
  CustomerQuotesListResponse,
  DeclineQuotePayload,
  QuotesQuery,
};

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

function toQueryString(query?: QuotesQuery) {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Request a quotation for a part, tyre, battery or accessory
 * POST /quotes
 */
export async function createPartQuote(
  payload: CreateQuotePayload,
): Promise<CustomerQuote> {
  const res = await fetch(`${apiBase()}/quotes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.message || `HTTP ${res.status}`);
  }

  const json = (await res.json()) as { data?: CustomerQuote } & CustomerQuote;
  return json.data ?? json;
}

/**
 * List the current customer's quotation requests
 * GET /quotes
 */
export async function fetchCustomerQuotes(
  query?: QuotesQuery,
): Promise<CustomerQuotesListResponse> {
  const res = await fetch(`${apiBase()}/quotes${toQueryString(query)}`, {
    headers: {
      Accept: "application/json",
      ...getAuthHeader(),
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const json = (await res.json()) as {
    data?: CustomerQuotesListResponse;
  } & CustomerQuotesListResponse;
  return json.data ?? json;
}

/**
 * Get a specific quotation request and all AutoSecure responses
 * GET /quotes/:id
 */
export async function fetchCustomerQuote(
  id: string,
): Promise<CustomerQuote | null> {
  const res = await fetch(`${apiBase()}/quotes/${encodeURIComponent(id)}`, {
    headers: {
      Accept: "application/json",
      ...getAuthHeader(),
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = (await res.json()) as { data?: CustomerQuote } & CustomerQuote;
  return json.data ?? json;
}

/**
 * Upload sample/damaged part photos to a quotation request (up to 5 files)
 * POST /quotes/:id/images
 */
export async function uploadQuotePhotos(
  id: string,
  files: File[],
): Promise<CustomerQuote> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }

  const res = await fetch(
    `${apiBase()}/quotes/${encodeURIComponent(id)}/images`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...getAuthHeader(),
      },
      body: formData,
      signal: AbortSignal.timeout(20_000),
    },
  );

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const json = (await res.json()) as { data?: CustomerQuote } & CustomerQuote;
  return json.data ?? json;
}

/**
 * Accept a quotation reply from AutoSecure
 * POST /quotes/:id/accept
 */
export async function acceptPartQuote(
  id: string,
  responseId: string,
): Promise<CustomerQuote> {
  const payload: AcceptQuotePayload = { responseId };
  const res = await fetch(
    `${apiBase()}/quotes/${encodeURIComponent(id)}/accept`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    },
  );

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.message || `HTTP ${res.status}`);
  }

  const json = (await res.json()) as { data?: CustomerQuote } & CustomerQuote;
  return json.data ?? json;
}

/**
 * Decline a quotation with a reason
 * POST /quotes/:id/decline
 */
export async function declinePartQuote(
  id: string,
  reason: string,
): Promise<CustomerQuote> {
  const payload: DeclineQuotePayload = { reason };
  const res = await fetch(
    `${apiBase()}/quotes/${encodeURIComponent(id)}/decline`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    },
  );

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.message || `HTTP ${res.status}`);
  }

  const json = (await res.json()) as { data?: CustomerQuote } & CustomerQuote;
  return json.data ?? json;
}

/**
 * Cancel an open quotation request
 * POST /quotes/:id/cancel
 */
export async function cancelPartQuote(id: string): Promise<CustomerQuote> {
  const res = await fetch(
    `${apiBase()}/quotes/${encodeURIComponent(id)}/cancel`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...getAuthHeader(),
      },
      signal: AbortSignal.timeout(15_000),
    },
  );

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.message || `HTTP ${res.status}`);
  }

  const json = (await res.json()) as { data?: CustomerQuote } & CustomerQuote;
  return json.data ?? json;
}
