import type { ListingStatus, ListingType, QuotePrice, QuoteVehicle } from "./types";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue | undefined };

export type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
};

export type ApiErrorBody = {
  success?: false;
  statusCode?: number;
  message?: string | string[];
  error?: string;
  path?: string;
  timestamp?: string;
};

export type PaginationMeta = {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
};

export type PaginatedData<T> = { items: T[]; meta: PaginationMeta };
export type PageQuery = { page?: number; limit?: number; q?: string };

export type AdminAuthTokens = {
  access_token: string;
  refresh_token: string;
  accessToken?: string;
  refreshToken?: string;
};

export type ChangeAdminPasswordPayload = {
  oldPassword: string;
  newPassword: string;
};

export type AdminDashboard = {
  suppliers: number;
  customers: number;
  inquiries: number;
  listings: Partial<Record<ListingStatus | string, number>>;
  orders?: number;
  quotes?: number;
  contactMessages?: number;
};

export type AdminReportProduct = {
  _id: string;
  type: ListingType | string;
  status: ListingStatus | string;
  title: string;
  views: number;
};

export type AdminInquiryReportPoint = {
  _id: string;
  count: number;
};

export type AdminSupplierLeaderboardItem = {
  _id: string;
  count: number;
  companyName: string;
  email: string;
};

export type AdminReports = {
  mostViewedProducts: AdminReportProduct[];
  inquiriesOverTime: AdminInquiryReportPoint[];
  supplierLeaderboard: AdminSupplierLeaderboardItem[];
};

export type AdminSupplierStatus = "PENDING" | "ACTIVE" | "SUSPENDED";

export type AdminSupplier = {
  _id: string;
  email: string;
  role: "SUPPLIER";
  status: AdminSupplierStatus;
  firstName?: string;
  lastName?: string | null;
  companyName?: string;
  isHouseSupplier?: boolean;
  isEmailVerified?: boolean;
  avatarUrl?: string | null;
  phone?: string | null;
  physicalAddress?: string | null;
  companyDescription?: string | null;
  notificationPreferences?: Record<string, boolean>;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminListingSupplier = Pick<
  AdminSupplier,
  "_id" | "email" | "status" | "firstName" | "lastName" | "companyName" | "avatarUrl" | "phone" | "isHouseSupplier"
>;

export type AdminListingPrice = {
  retail?: number;
  promotional?: number;
  fleet?: number;
  currency?: string;
  financing?: { downPayment?: number; emi?: number };
  priceRange?: { min?: number; max?: number; currency?: string; isManual?: boolean };
  internal?: JsonObject;
};

export type AdminListing = {
  _id: string;
  type: ListingType;
  status: ListingStatus | string;
  title: string;
  description?: string;
  supplier?: AdminListingSupplier;
  pricing?: AdminListingPrice;
  priceRange?: { min?: number; max?: number; currency?: string; isManual?: boolean };
  images?: string[];
  videos?: string[];
  brand?: string;
  model?: string;
  year?: number;
  condition?: string;
  transmission?: string;
  fuelType?: string;
  color?: string;
  bodyType?: string;
  inStock?: boolean;
  seatingCapacity?: number;
  keyFeatures?: string[];
  vehicleCategories?: string[];
  useCases?: string[];
  availableColours?: string[];
  partName?: string;
  partCategory?: string;
  vehicleCompatibility?: string[];
  views?: number;
  isFeatured?: boolean;
  isHouseListing?: boolean;
  hotDeal?: { isActive: boolean; label?: string; startsAt?: string; endsAt?: string };
  provenance?: JsonObject;
  unverifiedSections?: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: JsonValue | AdminListingSupplier | AdminListingPrice | undefined;
};

export type AdminListingsQuery = PageQuery & {
  status?: ListingStatus | string;
  type?: ListingType | string;
  supplierId?: string;
  supplier?: string;
  hasUnverified?: boolean;
  hotDeal?: boolean;
  isHouseListing?: boolean;
};

export type AdminListingPayload = {
  type: ListingType;
  title: string;
  description?: string;
  status?: ListingStatus;
  supplierId?: string;
  pricing?: AdminListingPrice;
  brand?: string;
  model?: string;
  year?: number;
  condition?: string;
  transmission?: string;
  fuelType?: string;
  bodyType?: string;
  color?: string;
  inStock?: boolean;
  seatingCapacity?: number;
  keyFeatures?: string[];
  partName?: string;
  partCategory?: string;
  vehicleCompatibility?: string[];
  [key: string]: JsonValue | AdminListingPrice | undefined;
};
export type AdminListingMutationResult = { listing: AdminListing };

export type ContactMessageStatus = "NEW" | "IN_PROGRESS" | "RESOLVED";

export type AdminContactMessage = {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  emailDelivered: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminContactMessageDocument =
  | AdminContactMessage
  | { _doc: AdminContactMessage };

export type ContactMessageStats = {
  new: number;
  inProgress: number;
  resolved: number;
  total: number;
};

export type AdminContactMessagesQuery = {
  page?: number;
  limit?: number;
  status?: ContactMessageStatus;
};

export type AdminConfigType =
  | "VEHICLE_BRAND"
  | "VEHICLE_MODEL"
  | "VEHICLE_CATEGORY"
  | "PART_CATEGORY"
  | "DELIVERY_OPTION"
  | "PRICING_RULE";

export type AdminConfigItem = {
  _id: string;
  type: AdminConfigType;
  value: string;
  metadata?: JsonValue;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateAdminConfigPayload = {
  type: AdminConfigType;
  value: string;
  metadata?: JsonValue;
  isActive?: boolean;
};
export type UpdateAdminConfigPayload = Partial<CreateAdminConfigPayload>;
export type DeleteAdminConfigResult = { success: boolean };

export type AttributeDataType = "STRING" | "NUMBER" | "BOOLEAN" | "ENUM" | string;

export type AdminAttribute = {
  _id: string;
  key: string;
  label: string;
  group: string;
  dataType: AttributeDataType;
  unit?: string | null;
  options: string[];
  path: string;
  scopes: string[];
  filterable: boolean;
  comparable: boolean;
  order: number;
  isActive: boolean;
  isCore?: boolean;
  metadata?: JsonObject;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminAttributePayload = Omit<AdminAttribute, "_id" | "isCore" | "createdAt" | "updatedAt">;
export type AdminAttributesQuery = { group?: string; filterable?: boolean; scope?: string };
export type DeleteAttributeResult = { id: string };

export type AdminTaxonomyTerm = {
  _id: string;
  slug: string;
  kind: string;
  name: string;
  order: number;
  parent?: string | null;
  metadata?: JsonObject;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminTaxonomyPayload = {
  kind: string;
  name: string;
  slug?: string;
  parent?: string | null;
  order?: number;
  metadata?: JsonObject;
  isActive?: boolean;
};
export type AdminTaxonomyQuery = { kind?: string; parent?: string; isActive?: boolean; q?: string };
export type ReorderItem = { id: string; order: number };
export type TaxonomyReorderResult = { matched: number; modified: number };
export type DeleteTaxonomyResult = { id: string };

export type AdminTrimStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | string;
export type AdminTrim = {
  _id: string;
  slug?: string;
  brandSlug: string;
  brandName?: string;
  modelSlug: string;
  modelName?: string;
  name: string;
  year: number;
  yearTo?: number;
  status?: AdminTrimStatus;
  vehicleCategories?: string[];
  vehicleType?: string;
  bodyType?: string;
  powertrain?: string;
  driveType?: string;
  useCases?: string[];
  countryOfOrigin?: string;
  availableColours?: string[];
  specs?: JsonObject;
  review?: JsonObject;
  priceRange?: { min?: number; max?: number; currency?: string };
  landingCostNote?: string;
  images?: string[];
  provenance?: JsonObject;
  unverifiedSections?: string[];
  listingCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminTrimPayload = Omit<AdminTrim, "_id" | "slug" | "status" | "provenance" | "unverifiedSections" | "listingCount" | "createdAt" | "updatedAt">;
export type AdminTrimsQuery = PageQuery & { brandSlug?: string; modelSlug?: string; year?: number | string; hasUnverified?: boolean; status?: string };
export type DeleteTrimResult = { id: string };
export type DuplicateTrimPayload = { year?: number; name?: string };

export type AdminOrderStage = {
  _id: string;
  key: string;
  label: string;
  description?: string;
  order: number;
  isTerminal: boolean;
  isActive: boolean;
};

export type AdminOrderStagePayload = Omit<AdminOrderStage, "_id">;
export type OrderStageReorderResult = { matched: number; modified: number };
export type DeleteOrderStageResult = { id: string };

export type AdminPerson = { _id: string; email: string; firstName?: string; lastName?: string | null };
export type AdminOrderVehicle = { title: string; brand?: string; model?: string; trimName?: string; year?: number; colour?: string; vin?: string; image?: string };
export type AdminOrderHistory = { _id?: string; stageKey: string; stageLabel: string; note?: string; updatedBy?: AdminPerson; at: string };

export type AdminOrder = {
  _id: string;
  reference: string;
  customer: AdminPerson;
  vehicle: AdminOrderVehicle;
  agreedPrice?: QuotePrice;
  currentStageKey: string;
  currentStageLabel: string;
  status: string;
  history: AdminOrderHistory[];
  estimatedDeliveryDate?: string;
  deliveryAddress?: string;
  internalNotes?: string;
  createdBy?: AdminPerson;
  createdAt: string;
  updatedAt: string;
};

export type AdminQuote = {
  _id: string;
  reference: string;
  customer: AdminPerson;
  vehicle: QuoteVehicle;
  productType: string;
  partCategorySlug?: string | null;
  partName: string;
  oemNumber?: string | null;
  listing?: string | null;
  quantity: number;
  notes?: string | null;
  images: string[];
  status: string;
  statusReason?: string | null;
  acceptedResponseId?: string | null;
  assignedSupplier?: AdminSupplier | null;
  responses: AdminQuoteResponse[];
  createdAt: string;
  updatedAt: string;
};

export type AdminQuoteResponse = {
  _id?: string;
  id?: string;
  responder?: AdminPerson;
  responderRole?: string;
  price: QuotePrice;
  availability?: string;
  leadTimeDays?: number;
  partCondition?: string | null;
  message?: string;
  listing?: string | null;
  validUntil?: string | null;
  at?: string;
  respondedBy?: string;
  accepted?: boolean;
};

export type AdminNotification = {
  _id: string;
  user?: string;
  title: string;
  body: string;
  type: string;
  data?: JsonObject;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type AdminAiConfig = {
  enabled: boolean;
  model: string;
  allowedModels: string[];
  webSearch: boolean;
  dailyLimit: number;
  usedToday: number;
  pricing: { currency: string; unit: string; models: Record<string, { input: number; cached: number; output: number }>; webSearchPer1kCalls?: number };
};

export type AdminAiGeneration = {
  _id: string;
  type?: string;
  status?: string;
  model?: string;
  draft?: JsonObject;
  sources?: JsonValue[];
  usage?: JsonObject;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateSupplierStatusPayload = { status: AdminSupplierStatus };
export type VerifySectionsPayload = { sections: string[] | "all"; note?: string };
export type UpdateListingPricingPayload = {
  retail?: number;
  currency?: string;
  priceRange?: { min?: number; max?: number; currency?: string } | null;
  internal?: JsonObject;
};
export type UpdateHotDealPayload = { isActive: boolean; label?: string; startsAt?: string; endsAt?: string };
export type UpdateFeaturedPayload = { isFeatured: boolean };
export type UpdateHotDealResult = { isLive: boolean; listing: AdminListing };
export type UpdateContactMessageStatusPayload = { status: ContactMessageStatus };

export type CreateAdminOrderPayload = {
  customerEmail: string;
  vehicle: AdminOrderVehicle;
  agreedPrice?: QuotePrice;
  stageKey?: string;
  note?: string;
  estimatedDeliveryDate?: string;
  deliveryAddress?: string;
};
export type UpdateAdminOrderPayload = Partial<Pick<AdminOrder, "vehicle" | "agreedPrice" | "estimatedDeliveryDate" | "deliveryAddress" | "internalNotes">>;
export type UpdateAdminOrderStatusPayload = { stageKey: string; note?: string; notifyCustomer?: boolean };
export type CancelAdminOrderPayload = { reason: string };
export type AdminOrdersQuery = PageQuery & { status?: string; stageKey?: string; customerId?: string };

export type AssignAdminQuotePayload = { supplierId: string | null };
export type RespondToAdminQuotePayload = {
  price: QuotePrice;
  availability?: string;
  leadTimeDays?: number;
  partCondition?: string;
  message?: string;
  validUntil?: string;
};
export type CloseAdminQuotePayload = { reason: string };
export type AdminQuotesQuery = PageQuery & {
  status?: string;
  assignedSupplier?: string;
  brandSlug?: string;
  productType?: string;
};

export type SendAdminNotificationPayload = {
  audience: string;
  userId?: string;
  title: string;
  body: string;
  type: string;
};
export type SendAdminNotificationResult = { recipients: number };
export type AdminUnreadCount = { unreadCount: number };
export type MarkAllNotificationsReadResult = { updated: number };
export type AdminNotificationsQuery = Pick<PageQuery, "page" | "limit"> & { unreadOnly?: boolean };

export type GenerateVehiclePayload = {
  brand: string;
  model: string;
  year: number;
  trim?: string;
  currency?: string;
  condition?: string;
  aiModel?: string;
};
export type GeneratePartPayload = {
  productType: string;
  name: string;
  brand?: string;
  vehicle?: { brand?: string; model?: string; year?: number };
  size?: string;
  aiModel?: string;
};
export type ApplyGenerationPayload = {
  target: "TRIM" | "LISTING" | string;
  type?: ListingType | string;
  pricing?: AdminListingPrice;
  stock?: number;
};
export type AdminGenerationsQuery = PageQuery & { status?: string; type?: string; model?: string };
