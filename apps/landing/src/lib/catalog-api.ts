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
  seatingCapacity?: number;
  mileage?: string | number;
  partName?: string;
  partCategory?: string;
  vehicleCompatibility?: string[];
  inStock?: boolean;
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

export function toCar(vehicle: ApiInventoryItem): Car {
  const title = getItemTitle(vehicle);
  return {
    id: getItemId(vehicle),
    brand: deriveBrand(vehicle),
    model: deriveModel(vehicle) || title,
    category: toCarCategory(vehicle),
    badgeLabel: vehicle.year ? `New ${vehicle.year}` : "New",
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
    price: readPrice(vehicle),
    imageLabel: title,
  };
}

function toUsedCarCategory(vehicle: ApiInventoryItem): UsedCarCategory {
  if (vehicle.fuelType?.toUpperCase() === "HYBRID") return "Hybrid";
  return "Sedan";
}

export function toUsedCar(vehicle: ApiInventoryItem): UsedCar {
  const title = getItemTitle(vehicle);
  return {
    id: getItemId(vehicle),
    brand: deriveBrand(vehicle),
    category: toUsedCarCategory(vehicle),
    condition: vehicle.condition === "USED" ? "Good" : "Like New",
    fuelType:
      vehicle.fuelType?.toUpperCase() === "HYBRID" ? "Hybrid" : "Petrol",
    image: vehicle.images?.[0] ?? "/images/cars/vehicle1.svg",
    mileage: vehicle.mileage ? String(vehicle.mileage) : "Mileage N/A",
    model: deriveModel(vehicle) || title,
    price: readPrice(vehicle),
    statusBadges: ["Certified"],
    year: vehicle.year ? String(vehicle.year) : "N/A",
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
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    // 15-second timeout so slow Render cold-starts don't hang forever
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${url}`);
  }

  const json = (await res.json()) as unknown;
  return parseItems<ApiInventoryItem>(json);
}

/** Fetch brand-new cars from the PUBLIC vehicles catalog */
export async function fetchNewCars(): Promise<Car[]> {
  try {
    const items = await clientFetch("/catalog/vehicles?page=1&limit=10");
    const newOnly = items.filter((v) => v.type === "BRAND_NEW_CAR");
    return newOnly.map(toCar);
    // return items.length > 0 ? items.map(toCar) : [];
  } catch (err) {
    console.warn("[catalog-api] fetchNewCars failed:", err);
    return [];
  }
}

/** Fetch used cars from the PUBLIC vehicles catalog */
export async function fetchUsedCars(): Promise<UsedCar[]> {
  try {
    const items = await clientFetch("/catalog/vehicles?page=1&limit=10");
    const usedOnly = items.filter((v) => v.type === "USED_CAR");
    return usedOnly.map(toUsedCar);
    // return items.length > 0 ? items.map(toUsedCar) : [];
  } catch (err) {
    console.warn("[catalog-api] fetchUsedCars failed:", err);
    return [];
  }
}

/** Fetch parts from the PUBLIC parts catalog */
export async function fetchParts(): Promise<PartProduct[]> {
  try {
    const items = await clientFetch("/catalog/parts?page=1&limit=10");
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

/** Extract the WhatsApp link from any known response shape */
export function extractWhatsappLink(res: InquireResponse): string | undefined {
  const candidates = [
    res.whatsappLink,
    res.whatsappUrl,
    (res.data as Record<string, unknown> | undefined)?.whatsappLink,
    (res.data as Record<string, unknown> | undefined)?.whatsappUrl,
  ];
  return candidates.find((c) => typeof c === "string") as string | undefined;
}

async function clientPost(
  path: string,
  body: InquireData,
): Promise<InquireResponse> {
  const url = `${apiBase()}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
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
