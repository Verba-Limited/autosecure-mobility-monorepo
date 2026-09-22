import { toQueryString, type ApiClient } from "./client";
import type {
  AdminAttribute,
  AdminAttributePayload,
  AdminAttributesQuery,
  AdminAuthTokens,
  AdminConfigItem,
  AdminContactMessage,
  AdminContactMessageDocument,
  AdminContactMessagesQuery,
  CreateAdminConfigPayload,
  DeleteAttributeResult,
  DeleteAdminConfigResult,
  DeleteTaxonomyResult,
  DeleteTrimResult,
  DuplicateTrimPayload,
  AdminDashboard,
  AdminListing,
  AdminListingMutationResult,
  AdminListingPayload,
  AdminListingsQuery,
  AdminReports,
  AdminOrder,
  AdminOrderStage,
  AdminOrderStagePayload,
  AdminOrdersQuery,
  AdminNotification,
  AdminNotificationsQuery,
  AdminUnreadCount,
  AdminQuote,
  AdminQuotesQuery,
  AdminSupplier,
  AdminSupplierStatus,
  AdminTaxonomyPayload,
  AdminTaxonomyQuery,
  AdminTaxonomyTerm,
  AdminTrim,
  AdminTrimPayload,
  AdminTrimsQuery,
  ApiEnvelope,
  ContactMessageStats,
  ContactMessageStatus,
  ChangeAdminPasswordPayload,
  CancelAdminOrderPayload,
  CloseAdminQuotePayload,
  CreateAdminOrderPayload,
  DeleteOrderStageResult,
  PaginatedData,
  OrderStageReorderResult,
  ReorderItem,
  RespondToAdminQuotePayload,
  SendAdminNotificationPayload,
  SendAdminNotificationResult,
  MarkAllNotificationsReadResult,
  TaxonomyReorderResult,
  UpdateAdminConfigPayload,
  UpdateAdminOrderPayload,
  UpdateAdminOrderStatusPayload,
  UpdateFeaturedPayload,
  UpdateHotDealPayload,
  UpdateHotDealResult,
  UpdateListingPricingPayload,
  VerifySectionsPayload,
  AssignAdminQuotePayload,
} from "./admin-types";
import type {
  LoginPayload,
  RejectListingPayload,
} from "./types";

export function createAdminApi(client: ApiClient) {
  return {
    login(payload: LoginPayload) {
      return client.request<ApiEnvelope<AdminAuthTokens>>("/admin/auth/login", {
        method: "POST",
        body: payload,
      });
    },

    refresh(refreshToken: string) {
      return client.request<ApiEnvelope<AdminAuthTokens>>("/admin/auth/refresh", {
        method: "POST",
        body: { refreshToken },
      });
    },

    changePassword(
      accessToken: string,
      payload: ChangeAdminPasswordPayload,
    ) {
      return client.request<ApiEnvelope<null>>(
        "/admin/auth/change-password",
        {
          method: "POST",
          accessToken,
          body: payload,
        },
      );
    },

    getDashboard(accessToken: string) {
      return client.request<ApiEnvelope<AdminDashboard>>("/admin/dashboard", { accessToken });
    },

    getReports(accessToken: string) {
      return client.request<ApiEnvelope<AdminReports>>("/admin/dashboard/reports", { accessToken });
    },

    getSuppliers(accessToken: string, page = 1, limit = 10) {
      return client.request<ApiEnvelope<PaginatedData<AdminSupplier>>>(`/admin/suppliers${toQueryString({ page, limit })}`, {
        accessToken,
      });
    },

    updateSupplierStatus(
      accessToken: string,
      id: string,
      status: AdminSupplierStatus,
    ) {
      return client.request<ApiEnvelope<AdminSupplier>>(`/admin/suppliers/${id}/status`, {
        method: "PATCH",
        accessToken,
        body: { status },
      });
    },

    getListings(accessToken: string, queryOrStatus: AdminListingsQuery | string = {}, page = 1, limit = 10) {
      const query: AdminListingsQuery = typeof queryOrStatus === "string" ? { status: queryOrStatus, page, limit } : queryOrStatus;
      return client.request<ApiEnvelope<PaginatedData<AdminListing>>>(`/admin/listings${toQueryString(query)}`, { accessToken });
    },

    createListing(accessToken: string, payload: AdminListingPayload) {
      return client.request<ApiEnvelope<AdminListingMutationResult>>("/admin/listings", { method: "POST", accessToken, body: payload });
    },

    getListing(accessToken: string, id: string) {
      return client.request<ApiEnvelope<AdminListing>>(`/admin/listings/${id}`, { accessToken });
    },

    updateListing(accessToken: string, id: string, payload: Partial<AdminListingPayload>) {
      return client.request<ApiEnvelope<AdminListingMutationResult>>(`/admin/listings/${id}`, { method: "PATCH", accessToken, body: payload });
    },

    deleteListing(accessToken: string, id: string) {
      return client.request<ApiEnvelope<AdminListingMutationResult>>(`/admin/listings/${id}`, { method: "DELETE", accessToken });
    },

    verifyListingSections(accessToken: string, id: string, payload: VerifySectionsPayload) {
      return client.request<ApiEnvelope<AdminListingMutationResult>>(`/admin/listings/${id}/verify`, { method: "POST", accessToken, body: payload });
    },

    updateListingPricing(accessToken: string, id: string, payload: UpdateListingPricingPayload) {
      return client.request<ApiEnvelope<AdminListingMutationResult>>(`/admin/listings/${id}/pricing`, { method: "PATCH", accessToken, body: payload });
    },

    updateListingHotDeal(accessToken: string, id: string, payload: UpdateHotDealPayload) {
      return client.request<ApiEnvelope<UpdateHotDealResult>>(`/admin/listings/${id}/hot-deal`, { method: "PATCH", accessToken, body: payload });
    },

    updateListingFeatured(accessToken: string, id: string, payload: UpdateFeaturedPayload) {
      return client.request<ApiEnvelope<AdminListing>>(`/admin/listings/${id}/feature`, { method: "PATCH", accessToken, body: payload });
    },

    approveListing(accessToken: string, id: string) {
      return client.request<ApiEnvelope<AdminListing>>(`/admin/listings/${id}/approve`, {
        method: "PATCH",
        accessToken,
      });
    },

    rejectListing(
      accessToken: string,
      id: string,
      payload: RejectListingPayload,
    ) {
      return client.request<ApiEnvelope<AdminListing>>(`/admin/listings/${id}/reject`, {
        method: "PATCH",
        accessToken,
        body: payload,
      });
    },

    getConfig(accessToken: string, type?: string) {
      return client.request<ApiEnvelope<AdminConfigItem[]>>(
        `/admin/config${toQueryString({ type })}`,
        { accessToken },
      );
    },

    createConfig(accessToken: string, payload: CreateAdminConfigPayload) {
      return client.request<ApiEnvelope<AdminConfigItem>>("/admin/config", {
        method: "POST",
        accessToken,
        body: payload,
      });
    },

    updateConfig(accessToken: string, id: string, payload: UpdateAdminConfigPayload) {
      return client.request<ApiEnvelope<AdminConfigItem>>(`/admin/config/${id}`, {
        method: "PUT",
        accessToken,
        body: payload,
      });
    },

    deleteConfig(accessToken: string, id: string) {
      return client.request<ApiEnvelope<DeleteAdminConfigResult>>(`/admin/config/${id}`, {
        method: "DELETE",
        accessToken,
      });
    },

    // Contact messages
    getContactMessages(
      accessToken: string,
      query: AdminContactMessagesQuery = {},
    ) {
      return client.request<ApiEnvelope<PaginatedData<AdminContactMessage>>>(
        `/admin/contact-messages${toQueryString(query)}`,
        {
          accessToken,
        },
      );
    },

    getContactMessagesStats(accessToken: string) {
      return client.request<ApiEnvelope<ContactMessageStats>>(`/admin/contact-messages/stats`, { accessToken });
    },

    getContactMessage(accessToken: string, id: string) {
      return client.request<ApiEnvelope<AdminContactMessageDocument>>(`/admin/contact-messages/${id}`, { accessToken });
    },

    updateContactMessageStatus(
      accessToken: string,
      id: string,
      status: ContactMessageStatus,
    ) {
      return client.request<ApiEnvelope<AdminContactMessageDocument>>(`/admin/contact-messages/${id}/status`, {
        method: "PATCH",
        accessToken,
        body: { status },
      });
    },

    // ─── Section 17: Dynamic Filters & Attributes ─────────────────────────
    getAttributes(accessToken: string, query: AdminAttributesQuery = {}) {
      return client.request<ApiEnvelope<AdminAttribute[]>>(`/admin/attributes${toQueryString(query)}`, { accessToken });
    },

    createAttribute(accessToken: string, payload: AdminAttributePayload) {
      return client.request<ApiEnvelope<AdminAttribute>>("/admin/attributes", {
        method: "POST",
        accessToken,
        body: payload,
      });
    },

    getAttribute(accessToken: string, id: string) {
      return client.request<ApiEnvelope<AdminAttribute>>(`/admin/attributes/${id}`, { accessToken });
    },

    updateAttribute(accessToken: string, id: string, payload: Partial<AdminAttributePayload>) {
      return client.request<ApiEnvelope<AdminAttribute>>(`/admin/attributes/${id}`, {
        method: "PATCH",
        accessToken,
        body: payload,
      });
    },

    deleteAttribute(accessToken: string, id: string) {
      return client.request<ApiEnvelope<DeleteAttributeResult>>(`/admin/attributes/${id}`, {
        method: "DELETE",
        accessToken,
      });
    },

    // ─── Section 16 & 18: Dynamic Vehicle Taxonomy & Categories ─────────────
    getTaxonomy(accessToken: string, query: AdminTaxonomyQuery = {}) {
      return client.request<ApiEnvelope<AdminTaxonomyTerm[]>>(`/admin/taxonomy${toQueryString(query)}`, { accessToken });
    },

    createTaxonomyTerm(accessToken: string, payload: AdminTaxonomyPayload) {
      return client.request<ApiEnvelope<AdminTaxonomyTerm>>("/admin/taxonomy", {
        method: "POST",
        accessToken,
        body: payload,
      });
    },

    reorderTaxonomyTerms(accessToken: string, items: ReorderItem[]) {
      return client.request<ApiEnvelope<TaxonomyReorderResult>>("/admin/taxonomy/reorder", {
        method: "PATCH",
        accessToken,
        body: items,
      });
    },

    getTaxonomyTerm(accessToken: string, id: string) {
      return client.request<ApiEnvelope<AdminTaxonomyTerm>>(`/admin/taxonomy/${id}`, { accessToken });
    },

    updateTaxonomyTerm(accessToken: string, id: string, payload: Partial<AdminTaxonomyPayload>) {
      return client.request<ApiEnvelope<AdminTaxonomyTerm>>(`/admin/taxonomy/${id}`, {
        method: "PATCH",
        accessToken,
        body: payload,
      });
    },

    deleteTaxonomyTerm(accessToken: string, id: string) {
      return client.request<ApiEnvelope<DeleteTaxonomyResult>>(`/admin/taxonomy/${id}`, {
        method: "DELETE",
        accessToken,
      });
    },

    // ─── Section 18: Scalable Vehicle Trims & Specs Database ───────────────
    getTrims(accessToken: string, query: AdminTrimsQuery = {}) {
      return client.request<ApiEnvelope<PaginatedData<AdminTrim>>>(`/admin/trims${toQueryString(query)}`, { accessToken });
    },

    createTrim(accessToken: string, payload: AdminTrimPayload) {
      return client.request<ApiEnvelope<AdminTrim>>("/admin/trims", {
        method: "POST",
        accessToken,
        body: payload,
      });
    },

    getTrim(accessToken: string, id: string) {
      return client.request<ApiEnvelope<AdminTrim>>(`/admin/trims/${id}`, { accessToken });
    },

    updateTrim(accessToken: string, id: string, payload: Partial<AdminTrimPayload>) {
      return client.request<ApiEnvelope<AdminTrim>>(`/admin/trims/${id}`, {
        method: "PATCH",
        accessToken,
        body: payload,
      });
    },

    deleteTrim(accessToken: string, id: string) {
      return client.request<ApiEnvelope<DeleteTrimResult>>(`/admin/trims/${id}`, {
        method: "DELETE",
        accessToken,
      });
    },

    verifyTrimSections(accessToken: string, id: string, payload: { sections: string[] | "all"; note?: string }) {
      return client.request<ApiEnvelope<AdminTrim>>(`/admin/trims/${id}/verify`, {
        method: "POST",
        accessToken,
        body: payload,
      });
    },

    publishTrim(accessToken: string, id: string) {
      return client.request<ApiEnvelope<AdminTrim>>(`/admin/trims/${id}/publish`, {
        method: "POST",
        accessToken,
      });
    },

    unpublishTrim(accessToken: string, id: string) {
      return client.request<ApiEnvelope<AdminTrim>>(`/admin/trims/${id}/unpublish`, {
        method: "POST",
        accessToken,
      });
    },

    archiveTrim(accessToken: string, id: string) {
      return client.request<ApiEnvelope<AdminTrim>>(`/admin/trims/${id}/archive`, {
        method: "POST",
        accessToken,
      });
    },

    duplicateTrim(accessToken: string, id: string, payload?: DuplicateTrimPayload) {
      return client.request<ApiEnvelope<AdminTrim>>(`/admin/trims/${id}/duplicate`, {
        method: "POST",
        accessToken,
        body: payload ?? {},
      });
    },

    uploadTrimImages(accessToken: string, id: string, files: File[]) {
      const body = new FormData();
      files.forEach((file) => body.append("files", file));
      return client.request<ApiEnvelope<AdminTrim>>(`/admin/trims/${id}/images`, {
        method: "POST",
        accessToken,
        body,
      });
    },

    getOrderStages(accessToken: string) { return client.request<ApiEnvelope<AdminOrderStage[]>>("/admin/order-stages", { accessToken }); },
    createOrderStage(accessToken: string, payload: AdminOrderStagePayload) { return client.request<ApiEnvelope<AdminOrderStage>>("/admin/order-stages", { method: "POST", accessToken, body: payload }); },
    reorderOrderStages(accessToken: string, items: ReorderItem[]) { return client.request<ApiEnvelope<OrderStageReorderResult>>("/admin/order-stages/reorder", { method: "PATCH", accessToken, body: items }); },
    updateOrderStage(accessToken: string, id: string, payload: Partial<AdminOrderStagePayload>) { return client.request<ApiEnvelope<AdminOrderStage>>(`/admin/order-stages/${id}`, { method: "PATCH", accessToken, body: payload }); },
    deleteOrderStage(accessToken: string, id: string) { return client.request<ApiEnvelope<DeleteOrderStageResult>>(`/admin/order-stages/${id}`, { method: "DELETE", accessToken }); },

    createOrder(accessToken: string, payload: CreateAdminOrderPayload) { return client.request<ApiEnvelope<AdminOrder>>("/admin/orders", { method: "POST", accessToken, body: payload }); },
    getOrders(accessToken: string, query: AdminOrdersQuery = {}) { return client.request<ApiEnvelope<PaginatedData<AdminOrder>>>(`/admin/orders${toQueryString(query)}`, { accessToken }); },
    getOrder(accessToken: string, id: string) { return client.request<ApiEnvelope<AdminOrder>>(`/admin/orders/${id}`, { accessToken }); },
    updateOrder(accessToken: string, id: string, payload: UpdateAdminOrderPayload) { return client.request<ApiEnvelope<AdminOrder>>(`/admin/orders/${id}`, { method: "PATCH", accessToken, body: payload }); },
    updateOrderStatus(accessToken: string, id: string, payload: UpdateAdminOrderStatusPayload) { return client.request<ApiEnvelope<AdminOrder>>(`/admin/orders/${id}/status`, { method: "POST", accessToken, body: payload }); },
    cancelOrder(accessToken: string, id: string, payload: CancelAdminOrderPayload) { return client.request<ApiEnvelope<AdminOrder>>(`/admin/orders/${id}/cancel`, { method: "POST", accessToken, body: payload }); },

    getQuotes(accessToken: string, query: AdminQuotesQuery = {}) {
      return client.request<ApiEnvelope<PaginatedData<AdminQuote>>>(`/admin/quotes${toQueryString(query)}`, { accessToken });
    },
    getQuote(accessToken: string, id: string) {
      return client.request<ApiEnvelope<AdminQuote>>(`/admin/quotes/${encodeURIComponent(id)}`, { accessToken });
    },
    assignQuote(accessToken: string, id: string, payload: AssignAdminQuotePayload) {
      return client.request<ApiEnvelope<AdminQuote>>(`/admin/quotes/${encodeURIComponent(id)}/assign`, { method: "POST", accessToken, body: payload });
    },
    respondToQuote(accessToken: string, id: string, payload: RespondToAdminQuotePayload) {
      return client.request<ApiEnvelope<AdminQuote>>(`/admin/quotes/${encodeURIComponent(id)}/respond`, { method: "POST", accessToken, body: payload });
    },
    closeQuote(accessToken: string, id: string, payload: CloseAdminQuotePayload) {
      return client.request<ApiEnvelope<AdminQuote>>(`/admin/quotes/${encodeURIComponent(id)}/close`, { method: "POST", accessToken, body: payload });
    },

    sendNotification(accessToken: string, payload: SendAdminNotificationPayload) {
      return client.request<ApiEnvelope<SendAdminNotificationResult>>("/admin/notifications", { method: "POST", accessToken, body: payload });
    },
    getNotifications(accessToken: string, query: AdminNotificationsQuery = {}) {
      return client.request<ApiEnvelope<PaginatedData<AdminNotification>>>(`/admin/notifications${toQueryString(query)}`, { accessToken });
    },
    getNotificationUnreadCount(accessToken: string) {
      return client.request<ApiEnvelope<AdminUnreadCount>>("/admin/notifications/unread-count", { accessToken });
    },
    markAllNotificationsRead(accessToken: string) {
      return client.request<ApiEnvelope<MarkAllNotificationsReadResult>>("/admin/notifications/read-all", { method: "PATCH", accessToken });
    },
    markNotificationRead(accessToken: string, id: string) {
      return client.request<ApiEnvelope<null>>(`/admin/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH", accessToken });
    },
  };
}

