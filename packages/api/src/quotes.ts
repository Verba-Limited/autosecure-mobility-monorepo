import type { ApiClient } from "./client";
import type {
  AcceptQuotePayload,
  CreateQuotePayload,
  CustomerQuote,
  CustomerQuotesListResponse,
  DeclineQuotePayload,
  QuotesQuery,
} from "./types";

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

export function createQuotesApi(client: ApiClient) {
  return {
    /**
     * Request a quotation for a part, tyre, battery or accessory
     * POST /quotes
     */
    createQuote(payload: CreateQuotePayload, accessToken?: string) {
      return client.request<CustomerQuote>("/quotes", {
        method: "POST",
        accessToken,
        body: payload,
      });
    },

    /**
     * My quotation requests (paginated)
     * GET /quotes
     */
    getMyQuotes(query?: QuotesQuery, accessToken?: string) {
      return client.request<CustomerQuotesListResponse>(
        `/quotes${toQueryString(query)}`,
        {
          accessToken,
        },
      );
    },

    /**
     * A quotation request and its replies
     * GET /quotes/:id
     */
    getQuote(id: string, accessToken?: string) {
      return client.request<CustomerQuote>(`/quotes/${encodeURIComponent(id)}`, {
        accessToken,
      });
    },

    /**
     * Attach photos to a quotation request (up to 5)
     * POST /quotes/:id/images
     */
    uploadQuoteImages(id: string, formData: FormData, accessToken?: string) {
      return client.request<CustomerQuote>(
        `/quotes/${encodeURIComponent(id)}/images`,
        {
          method: "POST",
          accessToken,
          body: formData,
        },
      );
    },

    /**
     * Accept a quotation reply
     * POST /quotes/:id/accept
     */
    acceptQuote(id: string, payload: AcceptQuotePayload, accessToken?: string) {
      return client.request<CustomerQuote>(
        `/quotes/${encodeURIComponent(id)}/accept`,
        {
          method: "POST",
          accessToken,
          body: payload,
        },
      );
    },

    /**
     * Decline the quotation with a reason
     * POST /quotes/:id/decline
     */
    declineQuote(id: string, payload: DeclineQuotePayload, accessToken?: string) {
      return client.request<CustomerQuote>(
        `/quotes/${encodeURIComponent(id)}/decline`,
        {
          method: "POST",
          accessToken,
          body: payload,
        },
      );
    },

    /**
     * Cancel a quotation request
     * POST /quotes/:id/cancel
     */
    cancelQuote(id: string, accessToken?: string) {
      return client.request<CustomerQuote>(
        `/quotes/${encodeURIComponent(id)}/cancel`,
        {
          method: "POST",
          accessToken,
        },
      );
    },
  };
}
