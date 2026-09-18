export type UserRole = "CUSTOMER" | "SUPPLIER" | "ADMIN";

export type ListingType = "BRAND_NEW_CAR" | "USED_CAR" | "PART";

export type ListingStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "ARCHIVED";

export type VehicleCondition = "NEW" | "USED";

export type Transmission = "AUTOMATIC" | "MANUAL";

export type FuelType = "PETROL" | "DIESEL" | "HYBRID" | "ELECTRIC";

export type DeliveryOption = "STANDARD" | "NEXT_DAY" | "ECONOMY";

export type Pricing = {
  retail: number;
  promotional?: number;
  fleet?: number;
  financing?: {
    downPayment: number;
    emi: number;
  };
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type RegisterCustomerPayload = {
  email: string;
  password: string;
  role: "CUSTOMER";
  firstName: string;
  lastName: string;
};

export type RegisterSupplierPayload = {
  email: string;
  password: string;
  role: "SUPPLIER";
  firstName: string;
  lastName: string;
  companyName: string;
};

export type VerifyEmailPayload = {
  email: string;
  otp: string;
};

export type ResendOtpPayload = {
  email: string;
  purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET";
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type CreateCarListingPayload = {
  type: "BRAND_NEW_CAR" | "USED_CAR";
  title: string;
  description: string;
  pricing: Pricing;
  dealBadges?: string[];
  brand: string;
  model: string;
  year: number;
  condition: VehicleCondition;
  transmission: Transmission;
  fuelType: FuelType;
  mileage?: number;
  engineCapacity?: string;
  horsepower?: string;
  engineType?: string;
  driveType?: string;
  topSpeed?: string;
  fuelEconomy?: string;
  bodyType?: string;
  inStock?: boolean;
  color: string;
  seatingCapacity: number;
  keyFeatures?: string[];
};

export type CreatePartListingPayload = {
  type: "PART";
  title: string;
  description: string;
  pricing: Pricing;
  partName: string;
  partCategory: string;
  oemNumber?: string;
  brand: string;
  inStock: boolean;
  vehicleCompatibility: string[];
  warranty?: string;
  deliveryOptions: DeliveryOption[];
};

export type InquiryPayload = {
  customerPhone: string;
  customerEmail: string;
};

export type RejectListingPayload = {
  reason: string;
};

export type ConfigItemPayload = {
  type:
    | "VEHICLE_BRAND"
    | "VEHICLE_MODEL"
    | "VEHICLE_CATEGORY"
    | "PART_CATEGORY"
    | "DELIVERY_OPTION"
    | "PRICING_RULE";
  value: string;
  metadata?: string;
};

// ─── Catalog Domain & Query Types ──────────────────────────────────────────

export type CatalogOption = {
  value: string;
  label: string;
  count?: number;
  imageUrl?: string | null;
  parent?: string | null;
};

export type CatalogFacet = {
  key: string;
  label: string;
  param: string;
  multi?: boolean;
  options: CatalogOption[];
};

export type CatalogPriceBand = {
  value: string;
  label: string;
  min: number;
  max: number;
  currency: string;
  count?: number;
};

export type CatalogFilterAttribute = {
  key: string;
  param: string;
  label: string;
  group: string;
  dataType: string;
  unit?: string | null;
  options?: string[];
  min?: number | null;
  max?: number | null;
};

export type CatalogFiltersResponse = {
  scope?: "VEHICLE" | "PART" | string;
  category?: string | null;
  total?: number;
  facets?: CatalogFacet[];
  priceBands?: CatalogPriceBand[];
  year?: { min?: number; max?: number };
  price?: { min?: number | null; max?: number | null };
  attributes?: CatalogFilterAttribute[];
  sorts?: string[];
};

export type CatalogUseCase = {
  slug: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  count?: number;
};

export type CatalogTerm = {
  _id: string;
  slug: string;
  kind: string;
  name: string;
  order?: number;
  parent?: string | null;
  metadata?: Record<string, unknown>;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CatalogPopularBrand = {
  brand: string;
  brandSlug: string;
  logoUrl?: string | null;
  listingCount: number;
};

export type CatalogTrim = {
  _id: string;
  slug: string;
  name: string;
  brandSlug?: string;
  brandName?: string;
  modelSlug?: string;
  modelName?: string;
  year?: number;
  vehicleCategories?: string[];
  bodyType?: string;
  powertrain?: string;
  useCases?: string[];
  availableColours?: string[];
  images?: string[];
  specs?: Record<string, unknown>;
  status?: string;
  countryOfOrigin?: string | null;
  priceVisible?: boolean;
  priceRequiresLogin?: boolean;
  priceRange?: {
    min?: number;
    max?: number;
    currency?: string;
    display?: string;
  } | null;
  review?: Record<string, unknown>;
  listings?: unknown[];
  alternatives?: CatalogTrim[];
};

export type CatalogBanner = {
  _id: string;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  order?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CatalogHomeResponse = {
  categories?: CatalogOption[];
  hotDeals?: unknown[];
  featured?: unknown[];
  banners?: CatalogBanner[];
  popularBrands?: CatalogPopularBrand[];
  useCases?: CatalogUseCase[];
};

export type CatalogSearchSuggestion = {
  key: string;
  reason: string;
  items: unknown[];
};

export type CatalogSearchResponse<T = unknown> = {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  exactMatch: boolean;
  suggestions?: CatalogSearchSuggestion[];
};

export type CatalogComparisonRow = {
  key: string;
  label: string;
  group: string;
  unit: string | null;
  values: (string | number | boolean | null)[];
  differs: boolean;
};

export type CatalogComparisonResponse<T = unknown> = {
  items: T[];
  rows: CatalogComparisonRow[];
};

export type CatalogContactChannels = {
  phone?: string;
  whatsapp?: string;
  email?: string;
};

export type CatalogSellerContact = {
  sellerName: string;
  phone?: string;
  email?: string;
  whatsappLink?: string;
  canMessageInApp?: boolean;
};

export type InquiryResponse = {
  success: boolean;
  whatsappLink?: string;
  message?: string;
};

// ─── Quotes (Customer) Domain & Payload Types ─────────────────────────────

export type QuoteVehicle = {
  brandSlug?: string;
  brandName?: string;
  modelSlug?: string | null;
  modelName?: string | null;
  trimId?: string | null;
  trimName?: string | null;
  year?: number | null;
  vin?: string | null;
  engine?: string | null;
};

export type QuoteProductType = "PART" | "TYRE" | "BATTERY" | "ACCESSORY" | string;

export type CreateQuotePayload = {
  vehicle: QuoteVehicle;
  productType: QuoteProductType;
  partCategorySlug?: string;
  partName: string;
  oemNumber?: string;
  quantity?: number;
  notes?: string;
  images?: string[];
};

export type QuotePrice = {
  amount: number;
  currency: string;
  _id?: string;
};

export type QuoteResponseItem = {
  id: string;
  price: QuotePrice;
  availability?: "IN_STOCK" | "OUT_OF_STOCK" | "SPECIAL_ORDER" | string;
  leadTimeDays?: number;
  partCondition?: string | null;
  message?: string;
  listing?: string | null;
  validUntil?: string | null;
  at?: string;
  respondedBy?: string; // Always AutoSecure for customer
  accepted?: boolean;
};

export type QuoteStatus = "OPEN" | "QUOTED" | "ACCEPTED" | "DECLINED" | "CANCELLED";

export type CustomerQuote = {
  _id: string;
  id?: string;
  reference: string;
  vehicle: QuoteVehicle;
  productType: QuoteProductType;
  partCategorySlug?: string | null;
  partName: string;
  oemNumber?: string | null;
  listing?: string | null;
  quantity: number;
  notes?: string | null;
  images: string[];
  status: QuoteStatus;
  statusReason?: string | null;
  acceptedResponseId?: string | null;
  responses: QuoteResponseItem[];
  createdAt: string;
  updatedAt: string;
};

export type CustomerQuotesListResponse = {
  items: CustomerQuote[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
};

export type AcceptQuotePayload = {
  responseId: string;
};

export type DeclineQuotePayload = {
  reason: string;
};

export type QuotesQuery = {
  page?: number | string;
  limit?: number | string;
  status?: QuoteStatus | string;
};

// ─── Supplier Domain & Payload Types ────────────────────────────────────────

export type UpdateSupplierProfilePayload = {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  phone?: string;
  physicalAddress?: string;
  companyDescription?: string;
};

export type SupplierProfile = {
  _id: string;
  email: string;
  role: "SUPPLIER";
  status: string;
  isEmailVerified: boolean;
  isHouseSupplier?: boolean;
  companyName?: string;
  firstName?: string;
  lastName?: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
  physicalAddress?: string | null;
  companyDescription?: string | null;
  favorites?: unknown[];
  notificationPreferences?: Record<string, boolean>;
  createdAt?: string;
  updatedAt?: string;
};

export type SupplierDashboardStats = {
  inquiries?: number;
  listings?: Record<string, number>;
};

export type SupplierQuoteResponsePayload = {
  price: {
    amount: number;
    currency: string;
  };
  availability?: "IN_STOCK" | "OUT_OF_STOCK" | "SPECIAL_ORDER" | string;
  leadTimeDays?: number;
  partCondition?: string | null;
  message?: string;
  validUntil?: string | null;
};

export type AssignedQuote = {
  _id: string;
  id?: string;
  reference: string;
  vehicle: QuoteVehicle;
  productType: QuoteProductType;
  partName: string;
  partCategorySlug?: string | null;
  oemNumber?: string | null;
  listing?: string | null;
  quantity: number;
  notes?: string | null;
  images: string[];
  status: string;
  myResponses: Array<{
    id: string;
    price: QuotePrice;
    availability?: string;
    leadTimeDays?: number;
    partCondition?: string | null;
    message?: string;
    listing?: string | null;
    validUntil?: string | null;
    at?: string;
    accepted?: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type AssignedQuotesListResponse = {
  items: AssignedQuote[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
};


