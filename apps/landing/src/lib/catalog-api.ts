/**
 * catalog-api.ts
 *
 * NOTE: The /inventory endpoint requires a supplier Bearer token (401 without
 * one), so the landing pages CANNOT use it. Instead we use the public catalog
 * endpoints:
 *   - GET /catalog/vehicles?page=1&limit=10  → new & used cars
 *   - GET /catalog/parts?page=1&limit=10     → parts
 *
 * All three explorer components (NewCarsExplorer, UsedCarsExplorer,
 * PartsExplorer) fetch client-side from the browser — this avoids server-side
 * timeouts and 401 errors during Next.js SSR.
 */

import {
  createCatalogApi,
  createPublicApiClient,
  DEFAULT_PUBLIC_API_URL,
} from "@autosecure/api";
import type { Car, CarCategory } from "@/data/cars";
import { CARS } from "@/data/cars";
import type { PartCategory, PartProduct } from "@/data/parts";
import { PART_PRODUCTS } from "@/data/parts";
import type { UsedCar, UsedCarCategory } from "@/data/usedCars";
import { USED_CARS } from "@/data/usedCars";

export const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_AUTOSECURE_PUBLIC_API_URL ?? DEFAULT_PUBLIC_API_URL;

// Used only for server-side calls (if ever re-enabled)
const catalogApi = createCatalogApi(createPublicApiClient(PUBLIC_API_URL));
void catalogApi; // suppress unused warning — kept for reference

// ─── Shared API response shape ───────────────────────────────────────────────

type ApiListResponse<T> = {
  success?: boolean;
  statusCode?: number;
  data?: {
    items?: T[];
    listings?: T[];
  };
  items?: T[];
  listings?: T[];
};

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

export type CatalogTerm = {
  _id: string;
  slug: string;
  kind: string;
  name: string;
  order?: number;
  parent?: string | null;
  metadata?: Record<string, unknown>;
};

export type CatalogUseCase = {
  slug: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  count?: number;
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
  bodyType?: string;
  powertrain?: string;
  useCases?: string[];
  availableColours?: string[];
  images?: string[];
  specs?: Record<string, unknown>;
};

export type ApiInventoryItem = {
  _id: string;
  id?: string;
  /** BRAND_NEW_CAR | USED_CAR | PART */
  type?: string;
  supplier?: string;
  status?: string;
  title?: string;
  description?: string;
  price?: number;
  pricing?: {
    retail?: number;
    promotional?: number;
    fleet?: number;
    priceRange?: {
      min?: number;
      max?: number;
      currency?: string;
      display?: string;
    };
    financing?: {
      downPayment?: number;
      emi?: number;
    };
  };
  images?: string[];
  videos?: string[];
  brand?: string;
  model?: string;
  year?: number | string;
  condition?: string;
  transmission?: string;
  fuelType?: string;
  color?: string;
  interiorColor?: string;
  seatingCapacity?: number;
  mileage?: string | number;
  engineCapacity?: string;
  engineType?: string;
  horsepower?: string;
  driveType?: string;
  topSpeed?: string;
  fuelEconomy?: string;
  bodyType?: string;
  inStock?: boolean;
  keyFeatures?: string[];
  dealBadges?: string[];
  // Part-specific fields
  partName?: string;
  partCategory?: string;
  oemNumber?: string;
  warranty?: string;
  vehicleCompatibility?: string[];
  deliveryOptions?: string[];
  views?: number;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

// ─── Response parser (handles both flat and nested shapes) ───────────────────

function parseItems<T>(raw: unknown): T[] {
  if (!raw || typeof raw !== "object") return [];
  const r = raw as ApiListResponse<T>;
  return r.data?.items ?? r.data?.listings ?? r.items ?? r.listings ?? [];
}

// ─── Price reader ─────────────────────────────────────────────────────────────

function readPrice(item: ApiInventoryItem): number {
  if (typeof item.price === "number" && Number.isFinite(item.price)) {
    return item.price;
  }
  return (
    item.pricing?.retail ??
    item.pricing?.promotional ??
    item.pricing?.financing?.downPayment ??
    0
  );
}

function getItemId(item: ApiInventoryItem) {
  return item._id || item.id || item.title || Math.random().toString(36);
}

function getItemTitle(item: ApiInventoryItem) {
  return item.title || item.model || item.partName || "Listing";
}

/** Extract brand — skip leading 4-digit year tokens */
function deriveBrand(item: ApiInventoryItem): string {
  if (item.brand) return item.brand;
  const parts = getItemTitle(item).split(" ");
  const nonYear = parts.find((p) => !/^\d{4}$/.test(p));
  return nonYear ?? parts[0] ?? "Vehicle";
}

/** Extract model — title minus the leading year and brand word */
function deriveModel(item: ApiInventoryItem): string {
  if (item.model) return item.model;
  const title = getItemTitle(item);
  const words = title.split(" ");
  const withoutYear =
    words[0] && /^\d{4}$/.test(words[0]) ? words.slice(1) : words;
  const brand = deriveBrand(item);
  const withoutBrand = withoutYear.filter((w) => w !== brand);
  return withoutBrand.join(" ") || title;
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function toCarCategory(vehicle: ApiInventoryItem): CarCategory {
  const fuel = vehicle.fuelType?.toUpperCase();
  if (fuel === "ELECTRIC") return "Electric";
  if (fuel === "HYBRID") return "SUV";
  const body = (vehicle as Record<string, unknown>).bodyType;
  if (typeof body === "string") {
    if (/suv/i.test(body)) return "SUV";
    if (/sport/i.test(body)) return "Sports";
    if (/truck|pickup/i.test(body)) return "Truck";
  }
  return "Sedan";
}

import { formatVehiclePriceRange } from "@/lib/pricing-utils";

export { formatVehiclePriceRange };

export function toCar(vehicle: ApiInventoryItem): Car {
  const title = getItemTitle(vehicle);
  const price = readPrice(vehicle);
  const priceRange = formatVehiclePriceRange(vehicle);
  const apiPriceRange = vehicle.pricing?.priceRange;

  return {
    id: getItemId(vehicle),
    brand: deriveBrand(vehicle),
    model: deriveModel(vehicle) || title,
    year: vehicle.year ? String(vehicle.year) : "2025",
    category: toCarCategory(vehicle),
    vehicleType:
      vehicle.bodyType ??
      (toCarCategory(vehicle) === "SUV"
        ? "Luxury SUV"
        : toCarCategory(vehicle) === "Electric"
          ? "Electric Sedan"
          : "Sedan"),
    bodyType:
      (vehicle.bodyType as any) ??
      (toCarCategory(vehicle) === "Truck"
        ? "Pickup"
        : toCarCategory(vehicle) === "SUV"
          ? "SUV"
          : toCarCategory(vehicle) === "Sports"
            ? "Coupe"
            : "Sedan"),
    powertrain:
      vehicle.fuelType ??
      (toCarCategory(vehicle) === "Electric" ? "All-Electric" : "Turbo Petrol"),
    fuelType:
      (vehicle.fuelType as any) ??
      (toCarCategory(vehicle) === "Electric" ? "Fully Electric (EV)" : "Petrol"),
    driveType: (vehicle.driveType as any) ?? "AWD / 4WD",
    transmission: (vehicle.transmission as any) ?? "Automatic",
    seatingCapacity: vehicle.seatingCapacity ?? 5,
    countryOfOrigin: "Germany",
    keySpec:
      vehicle.transmission
        ? `${vehicle.transmission}${vehicle.horsepower ? ` · ${vehicle.horsepower}` : ""}`
        : vehicle.driveType ?? "Automatic",
    colors: vehicle.color
      ? [{ name: vehicle.color, hex: "#333333" }]
      : [
          { name: "Black", hex: "#111215" },
          { name: "White", hex: "#f5f6f8" },
          { name: "Silver", hex: "#8c929a" },
        ],
    badgeLabel: vehicle.year ? `New ${vehicle.year}` : "New 2025",
    hasVideo: Boolean(vehicle.videos?.length),
    image: vehicle.images?.[0] ?? "/images/cars/vichicle2.jpg",
    specs: [
      { label: "Fuel", value: vehicle.fuelType ?? "N/A" },
      { label: "Transmission", value: vehicle.transmission ?? "N/A" },
      {
        label: "Seats",
        value: vehicle.seatingCapacity
          ? String(vehicle.seatingCapacity)
          : "N/A",
      },
    ],
    price,
    priceRangeMin: apiPriceRange?.min,
    priceRangeMax: apiPriceRange?.max,
    priceRange,
    imageLabel: title,
  };
}

function toUsedCarCategory(vehicle: ApiInventoryItem): UsedCarCategory {
  if (vehicle.fuelType?.toUpperCase() === "HYBRID") return "Hybrid";
  return "Sedan";
}

export function toUsedCar(vehicle: ApiInventoryItem): UsedCar {
  const title = getItemTitle(vehicle);
  const price = readPrice(vehicle);
  const priceRange = formatVehiclePriceRange(vehicle);

  return {
    id: getItemId(vehicle),
    brand: deriveBrand(vehicle),
    category: toUsedCarCategory(vehicle),
    condition: vehicle.condition === "USED" ? "Good" : "Like New",
    fuelType:
      vehicle.fuelType?.toUpperCase() === "HYBRID" ? "Hybrid" : "Petrol",
    bodyType: vehicle.bodyType ?? "Sedan",
    driveType: vehicle.driveType ?? "FWD",
    transmission: vehicle.transmission ?? "Automatic",
    seatingCapacity: vehicle.seatingCapacity ?? 5,
    countryOfOrigin: "Japan",
    image: vehicle.images?.[0] ?? "/images/cars/vehicle1.svg",
    mileage: vehicle.mileage ? String(vehicle.mileage) : "Mileage N/A",
    model: deriveModel(vehicle) || title,
    colors: vehicle.color
      ? [{ name: vehicle.color, hex: "#333333" }]
      : [{ name: "Standard", hex: "#555555" }],
    price,
    priceRange,
    statusBadges: ["Certified"],
    year: vehicle.year ? String(vehicle.year) : "2022",
  };
}

function toPartCategory(item: ApiInventoryItem): PartCategory {
  const raw = (
    item.partCategory ??
    item.title ??
    item.description ??
    ""
  ).toLowerCase();
  if (/brake/i.test(raw)) return "Brakes";
  if (/suspension/i.test(raw)) return "Suspension";
  if (/engine/i.test(raw)) return "Engine Parts";
  if (/light|electrical/i.test(raw)) return "Lighting";
  if (/body/i.test(raw)) return "Body Kits";
  if (/tyre|tire|wheel/i.test(raw)) return "Wheels & Tyres";
  if (/exhaust/i.test(raw)) return "Exhaust";
  return "Engine Parts";
}

function toPartTone(category: PartCategory): string {
  const tones: Record<PartCategory, string> = {
    "Engine Parts": "bg-[#D8F9E3]",
    "Wheels & Tyres": "bg-[#FFF2D8]",
    Brakes: "bg-[#FFE1E5]",
    Exhaust: "bg-[#D8F9E3]",
    Lighting: "bg-[#D7EAFE]",
    Suspension: "bg-[#F0DFFF]",
    Interior: "bg-[#EEF1F6]",
    "Body Kits": "bg-[#243145]",
  };
  return tones[category];
}

export function toPart(part: ApiInventoryItem): PartProduct {
  const category = toPartCategory(part);
  return {
    id: getItemId(part),
    badge: part.inStock === false ? "Out of Stock" : "In Stock",
    badgeClassName:
      part.inStock === false
        ? "bg-[#94A3B8] text-white"
        : "bg-[#059669] text-white",
    category,
    description: part.description ?? "",
    imageToneClassName: toPartTone(category),
    name: getItemTitle(part),
    price: readPrice(part),
    ratingCount: part.views ?? 0,
    tag: part.brand ?? "Genuine",
    tagClassName: "bg-white text-[#F59E0B]",
    image: part.images?.[0] ?? "/images/icons/%23U2699%23Ufe0f.png",
  };
}

// ─── Convenience mappers (used by explorer components) ───────────────────────

export function mapToCars(items: ApiInventoryItem[]): Car[] {
  return items.map(toCar);
}

export function mapToUsedCars(items: ApiInventoryItem[]): UsedCar[] {
  return items.map(toUsedCar);
}

export function mapToParts(items: ApiInventoryItem[]): PartProduct[] {
  return items.map(toPart);
}

// ─── Client-side fetcher — runs in the BROWSER, not on the server ─────────────
//
// Uses the PUBLIC catalog endpoints that don't require a Bearer token:
//   • /catalog/vehicles  → new cars (BRAND_NEW_CAR) and used cars (USED_CAR)
//   • /catalog/parts     → spare parts (PART)
//
// Falls back to an empty array on any error; the caller decides the fallback UI.
// ─────────────────────────────────────────────────────────────────────────────

function apiBase(): string {
  const env =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_AUTOSECURE_PUBLIC_API_URL
      : undefined;
  return (env ?? PUBLIC_API_URL).replace(/\/+$/, "");
}

async function clientFetch(path: string): Promise<ApiInventoryItem[]> {
  const url = `${apiBase()}${path}`;
  const accessToken =
    typeof window === "undefined"
      ? null
      : localStorage.getItem("autosecure_customer_access_token");
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    // 15-second timeout so slow Render cold-starts don't hang forever
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${url}`);
  }

  const json = (await res.json()) as unknown;
  return parseItems<ApiInventoryItem>(json);
}

async function clientFetchJson<T>(path: string): Promise<T> {
  const accessToken =
    typeof window === "undefined"
      ? null
      : localStorage.getItem("autosecure_customer_access_token");
  const res = await fetch(`${apiBase()}${path}`, {
    headers: {
      Accept: "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as { data?: T } & T;
  return json.data ?? json;
}

/**
 * Fetch one catalog record with the current customer's access token when it is
 * available. The API intentionally omits protected price ranges anonymously.
 */
export async function fetchCatalogItem(
  path: string,
): Promise<ApiInventoryItem | null> {
  const accessToken =
    typeof window === "undefined"
      ? null
      : localStorage.getItem("autosecure_customer_access_token");
  const res = await fetch(`${apiBase()}${path}`, {
    headers: {
      Accept: "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = (await res.json()) as { data?: ApiInventoryItem | ApiInventoryItem[] } & ApiInventoryItem;
  const data = json.data ?? json;
  return Array.isArray(data) ? data[0] ?? null : data;
}

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

export type CatalogPopularBrand = {
  brand: string;
  brandSlug: string;
  logoUrl?: string | null;
  listingCount: number;
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

export type CatalogComparisonRow = {
  key: string;
  label: string;
  group: string;
  unit: string | null;
  values: (string | number | boolean | null)[];
  differs: boolean;
};

export type CatalogComparisonResponse = {
  items: ApiInventoryItem[];
  rows: CatalogComparisonRow[];
};

export type CatalogSearchSuggestion = {
  key: string;
  reason: string;
  items: ApiInventoryItem[];
};

export type CatalogSearchResponse = {
  items: ApiInventoryItem[];
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

export type SearchCatalogParams = {
  q: string;
  priceBand?: string;
  maxPrice?: number | string;
  minPrice?: number | string;
  bodyType?: string;
  powertrain?: string;
  useCase?: string;
  brand?: string;
  condition?: string;
  type?: "ALL" | "BRAND_NEW_CAR" | "USED_CAR" | "PART" | string;
  sort?: "relevance" | "newest" | "price_asc" | "price_desc" | "most_viewed" | "year_desc" | string;
  limit?: number | string;
  page?: number | string;
};

export type VehicleQueryParams = {
  category?: string;
  brand?: string;
  model?: string;
  trim?: string;
  vehicleType?: string;
  bodyType?: string;
  powertrain?: string;
  driveType?: string;
  transmission?: string;
  year?: number | string;
  minYear?: number | string;
  maxYear?: number | string;
  colour?: string;
  minSeats?: number | string;
  minRangeKm?: number | string;
  countryOfOrigin?: string;
  useCase?: string;
  condition?: "NEW" | "USED" | string;
  inStock?: boolean | string;
  hotDeal?: boolean | string;
  minPrice?: number | string;
  maxPrice?: number | string;
  priceBand?: string;
  sort?: "newest" | "oldest" | "price_asc" | "price_desc" | "most_viewed" | "year_desc" | string;
  limit?: number | string;
  page?: number | string;
  [key: `attr.${string}`]: string | number | boolean | undefined;
};

export type PartsQueryParams = {
  type?: "PART" | "TYRE" | "BATTERY" | "ACCESSORY" | string;
  category?: string;
  condition?: "NEW" | "USED" | string;
  brand?: string;
  oemNumber?: string;
  inStock?: boolean | string;
  vehicleYear?: number | string;
  vehicleModel?: string;
  vehicleBrand?: string;
  vehicleTrim?: string;
  tyreWidth?: number | string;
  tyreAspect?: number | string;
  tyreRim?: number | string;
  batteryGroup?: string;
  minCca?: number | string;
  priceBand?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  sort?: string;
  limit?: number | string;
  page?: number | string;
  [key: `attr.${string}`]: string | number | boolean | undefined;
};

export async function fetchCatalogHome() {
  return clientFetchJson<{
    categories?: CatalogOption[];
    hotDeals?: ApiInventoryItem[];
    featured?: ApiInventoryItem[];
    banners?: CatalogBanner[];
    popularBrands?: CatalogPopularBrand[];
    useCases?: CatalogUseCase[];
  }>("/catalog/home");
}

export async function searchCatalog(queryOrParams: string | SearchCatalogParams): Promise<CatalogSearchResponse> {
  const params =
    typeof queryOrParams === "string"
      ? { q: queryOrParams }
      : queryOrParams;
  const searchParams = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== "") {
      searchParams.set(key, String(val));
    }
  }
  return clientFetchJson<CatalogSearchResponse>(`/catalog/search?${searchParams.toString()}`);
}

export async function fetchCatalogFilters(
  scope: "VEHICLE" | "PART" | string = "VEHICLE",
  category?: string,
): Promise<CatalogFiltersResponse> {
  const query = new URLSearchParams({ scope });
  if (category) query.set("category", category);
  return clientFetchJson<CatalogFiltersResponse>(`/catalog/filters?${query}`);
}

export async function fetchCatalogUseCases(): Promise<CatalogUseCase[]> {
  return clientFetchJson<CatalogUseCase[]>("/catalog/use-cases");
}

export async function fetchCatalogTaxonomy(query?: { kind?: string; parent?: string }): Promise<CatalogTerm[]> {
  const params = new URLSearchParams();
  if (query?.kind) params.set("kind", query.kind);
  if (query?.parent) params.set("parent", query.parent);
  const qs = params.toString();
  return clientFetchJson<CatalogTerm[]>(`/catalog/taxonomy${qs ? `?${qs}` : ""}`);
}

export async function fetchCatalogBrands(): Promise<CatalogTerm[]> {
  return clientFetchJson<CatalogTerm[]>("/catalog/brands");
}

export async function fetchPopularCatalogBrands(limit?: number): Promise<CatalogPopularBrand[]> {
  const query = limit ? `?limit=${limit}` : "";
  return clientFetchJson<CatalogPopularBrand[]>(`/catalog/brands/popular${query}`);
}

export async function fetchBrandModels(brandSlug: string): Promise<CatalogTerm[]> {
  return clientFetchJson<CatalogTerm[]>(`/catalog/brands/${encodeURIComponent(brandSlug)}/models`);
}

export async function fetchModelTrims(modelSlug: string, year?: number | string): Promise<CatalogTrim[]> {
  const query = year ? `?year=${year}` : "";
  return clientFetchJson<CatalogTrim[]>(`/catalog/models/${encodeURIComponent(modelSlug)}/trims${query}`);
}

export async function fetchCatalogTrims(
  queryOrParams?: string | { q?: string; brand?: string; model?: string; bodyType?: string; powertrain?: string; useCase?: string; limit?: number | string; page?: number | string },
): Promise<{ items: CatalogTrim[]; meta?: unknown }> {
  let qs = "";
  if (typeof queryOrParams === "string") {
    qs = queryOrParams ? `?q=${encodeURIComponent(queryOrParams)}` : "";
  } else if (queryOrParams && typeof queryOrParams === "object") {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(queryOrParams)) {
      if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
    }
    qs = params.toString() ? `?${params.toString()}` : "";
  }
  return clientFetchJson<{ items: CatalogTrim[]; meta?: unknown }>(`/catalog/trims${qs}`);
}

export async function fetchCatalogTrim(
  trimSlug: string,
): Promise<CatalogTrim & { review?: Record<string, unknown>; listings?: ApiInventoryItem[]; alternatives?: CatalogTrim[] }> {
  return clientFetchJson<
    CatalogTrim & { review?: Record<string, unknown>; listings?: ApiInventoryItem[]; alternatives?: CatalogTrim[] }
  >(`/catalog/trims/${encodeURIComponent(trimSlug)}`);
}

export async function fetchFeaturedVehicles(limit?: number): Promise<ApiInventoryItem[]> {
  const query = limit ? `?limit=${limit}` : "";
  const items = await clientFetchJson<ApiInventoryItem[]>(`/catalog/vehicles/featured${query}`);
  return Array.isArray(items) ? items : [];
}

export async function fetchFeaturedCars(limit?: number): Promise<Car[]> {
  const items = await fetchFeaturedVehicles(limit);
  return items.map(toCar);
}

export async function fetchHotDeals(limit?: number): Promise<ApiInventoryItem[]> {
  const query = limit ? `?limit=${limit}` : "";
  const items = await clientFetchJson<ApiInventoryItem[]>(`/catalog/hot-deals${query}`);
  return Array.isArray(items) ? items : [];
}

export async function fetchVehicleComparison(
  input: string[] | { ids?: string[]; trimIds?: string[] },
): Promise<{ items: Car[]; rawItems: ApiInventoryItem[]; rows: CatalogComparisonRow[] }> {
  const query = new URLSearchParams();
  if (Array.isArray(input)) {
    if (input.length) query.set("ids", input.slice(0, 4).join(","));
  } else {
    if (input.ids?.length) query.set("ids", input.ids.slice(0, 4).join(","));
    if (input.trimIds?.length) query.set("trimIds", input.trimIds.slice(0, 4).join(","));
  }
  const result = await clientFetchJson<CatalogComparisonResponse>(
    `/catalog/vehicles/compare${query.toString() ? `?${query.toString()}` : ""}`,
  );
  const rawItems = result.items ?? [];
  return {
    items: rawItems.map(toCar),
    rawItems,
    rows: result.rows ?? [],
  };
}

export async function fetchVehicle(id: string): Promise<ApiInventoryItem | null> {
  return fetchCatalogItem(`/catalog/vehicles/${encodeURIComponent(id)}`);
}

export async function fetchVehicles(
  params?: VehicleQueryParams,
): Promise<{ items: ApiInventoryItem[]; meta?: unknown; exactMatch?: boolean }> {
  const searchParams = new URLSearchParams();
  if (params) {
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== "") {
        searchParams.set(key, String(val));
      }
    }
  }
  const qs = searchParams.toString();
  const url = `/catalog/vehicles${qs ? `?${qs}` : ""}`;
  return clientFetchJson<{ items: ApiInventoryItem[]; meta?: unknown; exactMatch?: boolean }>(url);
}

export async function fetchPart(id: string): Promise<ApiInventoryItem | null> {
  return fetchCatalogItem(`/catalog/parts/${encodeURIComponent(id)}`);
}

export async function fetchCatalogContact(): Promise<{ phone?: string; whatsapp?: string; email?: string }> {
  return clientFetchJson<{ phone?: string; whatsapp?: string; email?: string }>("/catalog/contact");
}

export async function fetchListingSellerContact(
  listingId: string,
): Promise<{ sellerName?: string; phone?: string; email?: string; whatsappLink?: string; canMessageInApp?: boolean }> {
  return clientFetchJson<{
    sellerName?: string;
    phone?: string;
    email?: string;
    whatsappLink?: string;
    canMessageInApp?: boolean;
  }>(`/catalog/listings/${encodeURIComponent(listingId)}/seller-contact`);
}

export async function fetchCatalogConfig(
  type?: string,
): Promise<Array<{ _id: string; type: string; value: string; metadata?: string | Record<string, unknown>; isActive?: boolean }>> {
  const query = type ? `?type=${encodeURIComponent(type)}` : "";
  return clientFetchJson<
    Array<{ _id: string; type: string; value: string; metadata?: string | Record<string, unknown>; isActive?: boolean }>
  >(`/catalog/config${query}`);
}

/** Fetch brand-new cars from the PUBLIC vehicles catalog */
export async function fetchNewCars(): Promise<Car[]> {
  try {
    const items = await clientFetch("/catalog/vehicles?page=1&limit=100");
    const newOnly = items.filter((v) => v.type === "BRAND_NEW_CAR");
    return newOnly.map(toCar);
  } catch (err) {
    console.warn("[catalog-api] fetchNewCars failed:", err);
    return [];
  }
}

/** Homepage promotions managed by the backend, not a hand-maintained fixture. */
export async function fetchHotDealCars(limit = 6): Promise<Car[]> {
  try {
    const items = await fetchHotDeals(limit);
    return items
      .filter((item) => item.type !== "PART")
      .map(toCar);
  } catch (err) {
    console.warn("[catalog-api] fetchHotDealCars failed:", err);
    return [];
  }
}

/** Fetch used cars from the PUBLIC vehicles catalog */
export async function fetchUsedCars(): Promise<UsedCar[]> {
  try {
    const items = await clientFetch("/catalog/vehicles?page=1&limit=10");
    const usedOnly = items.filter((v) => v.type === "USED_CAR");
    return usedOnly.map(toUsedCar);
  } catch (err) {
    console.warn("[catalog-api] fetchUsedCars failed:", err);
    return [];
  }
}

/** Fetch parts from the PUBLIC parts catalog */
export async function fetchParts(params?: PartsQueryParams): Promise<PartProduct[]> {
  try {
    let url = "/catalog/parts?page=1&limit=20";
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, val] of Object.entries(params)) {
        if (val !== undefined && val !== null && val !== "") {
          searchParams.set(key, String(val));
        }
      }
      url = `/catalog/parts?${searchParams.toString()}`;
    }
    const items = await clientFetch(url);
    return items.length > 0 ? items.map(toPart) : [];
  } catch (err) {
    console.warn("[catalog-api] fetchParts failed:", err);
    return [];
  }
}


// ─── Inquire helpers — browser-side POST calls ───────────────────────────────

export type InquireData = {
  customerPhone?: string;
  customerEmail?: string;
};

export type InquireResponse = Record<string, unknown>;

export const AUTOSECURE_WHATSAPP_NUMBER = "2347033812556"; // +234 703 381 2556
export const AUTOSECURE_WHATSAPP_DISPLAY = "+234 703 381 2556";

export function buildWhatsappUrl(text?: string, phone = AUTOSECURE_WHATSAPP_NUMBER): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  if (!text) {
    return `https://wa.me/${cleanPhone}`;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/** Extract the WhatsApp link from any known response shape */
export function extractWhatsappLink(res: InquireResponse, fallbackText?: string): string {
  const candidates = [
    res.whatsappLink,
    res.whatsappUrl,
    (res.data as Record<string, unknown> | undefined)?.whatsappLink,
    (res.data as Record<string, unknown> | undefined)?.whatsappUrl,
  ];
  const found = candidates.find((c) => typeof c === "string") as string | undefined;
  if (found) {
    if (found.includes("wa.me/?") || found.includes("wa.me?")) {
      return found
        .replace(/wa\.me\/\?/, `wa.me/${AUTOSECURE_WHATSAPP_NUMBER}?`)
        .replace(/wa\.me\?/, `wa.me/${AUTOSECURE_WHATSAPP_NUMBER}?`);
    }
    return found;
  }
  return buildWhatsappUrl(fallbackText);
}

async function clientPost(
  path: string,
  body: InquireData,
): Promise<InquireResponse> {
  const url = `${apiBase()}${path}`;
  const accessToken =
    typeof window === "undefined"
      ? null
      : localStorage.getItem("autosecure_customer_access_token");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${url}`);
  }
  return (await res.json()) as InquireResponse;
}

/**
 * POST /catalog/vehicles/{id}/inquire
 * Returns the raw API response — call extractWhatsappLink() on it.
 */
export async function inquireVehicle(
  id: string,
  data: InquireData,
): Promise<InquireResponse> {
  return clientPost(`/catalog/vehicles/${id}/inquire`, data);
}

/**
 * POST /catalog/parts/{id}/inquire
 * Returns the raw API response — call extractWhatsappLink() on it.
 */
export async function inquirePart(
  id: string,
  data: InquireData,
): Promise<InquireResponse> {
  return clientPost(`/catalog/parts/${id}/inquire`, data);
}

// ─── Static fallbacks (re-exported for explorer components) ──────────────────

export { CARS, USED_CARS, PART_PRODUCTS };

// ─── Server-side helpers — kept for backward compatibility with page.tsx ──────
// These now return the static fallback immediately so the server never tries
// to call the protected /inventory endpoint.

export async function getCatalogVehicles(): Promise<Car[]> {
  return [];
}

export async function getCatalogUsedCars(): Promise<UsedCar[]> {
  return [];
}

export async function getCatalogParts(): Promise<PartProduct[]> {
  return [];
}

// ─── Customer Quotes Re-exports ─────────────────────────────────────────────
export * from "./quotes-api";

