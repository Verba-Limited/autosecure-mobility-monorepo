import type { ApiClient } from "./client";
import type {
  AssignedQuote,
  AssignedQuotesListResponse,
  CreateCarListingPayload,
  CreatePartListingPayload,
  QuotesQuery,
  SupplierDashboardStats,
  SupplierProfile,
  SupplierQuoteResponsePayload,
  UpdateSupplierProfilePayload,
} from "./types";

function toQueryString(query?: Record<string, string | number | boolean | undefined>) {
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

export function createSupplierApi(client: ApiClient) {
  return {
    // ─── Supplier Profile ───────────────────────────────────────────────────

    /**
     * Get supplier profile
     * GET /suppliers/profile
     */
    getProfile(accessToken: string) {
      return client.request<SupplierProfile>("/suppliers/profile", {
        accessToken,
      });
    },

    /**
     * Update supplier profile information
     * PUT /suppliers/profile
     */
    updateProfile(
      accessToken: string,
      payload: UpdateSupplierProfilePayload,
    ) {
      return client.request<SupplierProfile>("/suppliers/profile", {
        method: "PUT",
        accessToken,
        body: payload,
      });
    },

    /**
     * Upload or update supplier avatar/logo
     * POST /suppliers/profile/avatar
     */
    uploadAvatar(accessToken: string, formData: FormData) {
      return client.request<SupplierProfile>("/suppliers/profile/avatar", {
        method: "POST",
        accessToken,
        body: formData,
      });
    },

    /**
     * Delete supplier avatar/logo
     * DELETE /suppliers/profile/avatar
     */
    deleteAvatar(accessToken: string) {
      return client.request<SupplierProfile>("/suppliers/profile/avatar", {
        method: "DELETE",
        accessToken,
      });
    },

    // ─── Supplier Inventory & Dashboard ─────────────────────────────────────

    /**
     * Get supplier dashboard statistics
     * GET /inventory/dashboard
     */
    getDashboard(accessToken: string) {
      return client.request<SupplierDashboardStats>("/inventory/dashboard", {
        accessToken,
      });
    },

    /**
     * Get all listings belonging to the supplier (Paginated)
     * GET /inventory
     */
    getListings(
      accessToken: string,
      page = 1,
      limit = 10,
      sort?: string,
    ) {
      const query = toQueryString({ page, limit, sort });
      return client.request(`/inventory${query}`, {
        accessToken,
      });
    },

    /**
     * List inquiries received on the supplier's listings (paginated)
     * GET /inventory/inquiries
     */
    getInquiries(accessToken: string, page = 1, limit = 10) {
      const query = toQueryString({ page, limit });
      return client.request(`/inventory/inquiries${query}`, {
        accessToken,
      });
    },

    /**
     * Create a new car listing (Brand New or Used)
     * POST /inventory/cars
     */
    createCarListing(accessToken: string, payload: CreateCarListingPayload) {
      return client.request("/inventory/cars", {
        method: "POST",
        accessToken,
        body: payload,
      });
    },

    /**
     * Create a new aftermarket part listing
     * POST /inventory/parts
     */
    createPartListing(accessToken: string, payload: CreatePartListingPayload) {
      return client.request("/inventory/parts", {
        method: "POST",
        accessToken,
        body: payload,
      });
    },

    /**
     * Update an existing listing
     * PUT /inventory/:id
     */
    updateListing(accessToken: string, id: string, payload: unknown) {
      return client.request(`/inventory/${encodeURIComponent(id)}`, {
        method: "PUT",
        accessToken,
        body: payload,
      });
    },

    /**
     * Delete one of the supplier's own listings
     * DELETE /inventory/:id
     */
    deleteListing(accessToken: string, id: string) {
      return client.request(`/inventory/${encodeURIComponent(id)}`, {
        method: "DELETE",
        accessToken,
      });
    },

    /**
     * Upload images or videos for a listing (Up to 10 files at once)
     * POST /inventory/:id/media
     */
    uploadListingMedia(
      accessToken: string,
      id: string,
      files: File[] | FormData,
    ) {
      let body: FormData;
      if (files instanceof FormData) {
        body = files;
      } else {
        body = new FormData();
        files.forEach((file) => body.append("files", file));
      }

      return client.request(`/inventory/${encodeURIComponent(id)}/media`, {
        method: "POST",
        accessToken,
        body,
      });
    },

    /**
     * Submit a DRAFT listing for admin approval
     * POST /inventory/:id/submit
     */
    submitListing(accessToken: string, id: string) {
      return client.request(`/inventory/${encodeURIComponent(id)}/submit`, {
        method: "POST",
        accessToken,
      });
    },

    // ─── Quotes (Supplier) ──────────────────────────────────────────────────

    /**
     * Quotation requests assigned to me
     * GET /quotes/assigned
     */
    getAssignedQuotes(accessToken: string, query?: QuotesQuery) {
      return client.request<AssignedQuotesListResponse>(
        `/quotes/assigned${toQueryString(query)}`,
        {
          accessToken,
        },
      );
    },

    /**
     * An assigned quotation request
     * GET /quotes/assigned/:id
     */
    getAssignedQuote(accessToken: string, id: string) {
      return client.request<AssignedQuote>(
        `/quotes/assigned/${encodeURIComponent(id)}`,
        {
          accessToken,
        },
      );
    },

    /**
     * Send a quotation for an assigned request
     * POST /quotes/assigned/:id/respond
     */
    respondToQuote(
      accessToken: string,
      id: string,
      payload: SupplierQuoteResponsePayload,
    ) {
      return client.request<AssignedQuote>(
        `/quotes/assigned/${encodeURIComponent(id)}/respond`,
        {
          method: "POST",
          accessToken,
          body: payload,
        },
      );
    },

    // ─── Bookings (Supplier Perspective) ────────────────────────────────────

    /**
     * List bookings received on my listings (supplier view)
     * GET /bookings?as=supplier
     */
    getBookings(
      accessToken: string,
      query?: { status?: string; page?: number; limit?: number },
    ) {
      const q = toQueryString({ as: "supplier", ...query });
      return client.request(`/bookings${q}`, {
        accessToken,
      });
    },

    /**
     * Get a single booking
     * GET /bookings/:id
     */
    getBooking(accessToken: string, id: string) {
      return client.request(`/bookings/${encodeURIComponent(id)}`, {
        accessToken,
      });
    },

    /**
     * Confirm a booking (seller)
     * PATCH /bookings/:id/confirm
     */
    confirmBooking(accessToken: string, id: string) {
      return client.request(`/bookings/${encodeURIComponent(id)}/confirm`, {
        method: "PATCH",
        accessToken,
      });
    },

    /**
     * Decline a booking with a reason (seller)
     * PATCH /bookings/:id/reject
     */
    rejectBooking(accessToken: string, id: string, reason: string) {
      return client.request(`/bookings/${encodeURIComponent(id)}/reject`, {
        method: "PATCH",
        accessToken,
        body: { reason },
      });
    },
  };
}

