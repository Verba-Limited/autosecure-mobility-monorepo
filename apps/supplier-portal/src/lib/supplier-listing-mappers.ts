import type { Listing } from "@/components/portal/ListingsTable";

type UnknownRecord = Record<string, unknown>;

export type PortalListingRow = {
  id: string;
  name: string;
  added: string;
  category: "NEW CAR" | "USED CAR" | "PART";
  price: string;
  views: number;
  leads: number;
  status: "Active" | "Pending" | "Archived";
  iconSrc: string;
  condition?: string;
  description?: string;
  rawItem: unknown;
};

export function unwrapApiData(payload: unknown): unknown {
  if (isRecord(payload) && "data" in payload) {
    return payload.data;
  }

  return payload;
}

export function getApiItems(payload: unknown): unknown[] {
  const data = unwrapApiData(payload);

  if (Array.isArray(data)) {
    return data;
  }

  if (!isRecord(data)) {
    return [];
  }

  if (Array.isArray(data.items)) {
    return data.items;
  }

  if (Array.isArray(data.listings)) {
    return data.listings;
  }

  return [];
}

export function getApiTotalItems(payload: unknown) {
  const data = unwrapApiData(payload);

  if (!isRecord(data) || !isRecord(data.meta)) {
    return null;
  }

  const totalItems = data.meta.totalItems;
  if (typeof totalItems === "number") {
    return totalItems;
  }

  if (typeof totalItems === "string") {
    const parsed = Number(totalItems);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}
export function mapListingRow(item: unknown): PortalListingRow | null {
  if (!isRecord(item)) {
    return null;
  }

  const type = getString(item.type);
  const title =
    getString(item.title) || getString(item.name) || "Untitled listing";
  const category = mapListingType(type);

  return {
    id: getString(item._id) || getString(item.id) || title,
    name: title,
    added: formatAdded(getString(item.createdAt) || getString(item.updatedAt)),
    category,
    price: formatPrice(readPrice(item)),
    views: getNumber(item.views),
    leads: getNumber(item.leads) || getNumber(item.inquiries),
    status: mapStatus(getString(item.status)),
    condition: getString(item.condition),
    description: getString(item.description),
    iconSrc:
      category === "PART"
        ? "/nav-icons/%F0%9F%94%A7.png"
        : "/nav-icons/%F0%9F%9A%97.png",
    rawItem: item,
  };
}

export function mapRecentListing(item: unknown): Listing | null {
  const row = mapListingRow(item);

  if (!row) {
    return null;
  }

  const raw = (item as Record<string, unknown>) || {};
  const images = raw.images as string[] | undefined;

  return {
    id: row.id,
    name: row.name,
    emoji: "",
    image: images?.[0],
    type: row.category,
    price: row.price,
    views: row.views,
    status: row.status,
    rawItem: item,
  };
}

export function getDashboardNumber(payload: unknown, keys: string[]) {
  const data = unwrapApiData(payload);

  if (!isRecord(data)) {
    return null;
  }

  for (const key of keys) {
    const value = data[key];
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function mapListingType(type: string): PortalListingRow["category"] {
  if (type === "PART") {
    return "PART";
  }

  if (type === "USED_CAR") {
    return "USED CAR";
  }

  // BRAND_NEW_CAR or any unrecognised type → NEW CAR
  return "NEW CAR";
}

function mapStatus(status: string): PortalListingRow["status"] {
  if (status === "APPROVED") {
    return "Active";
  }

  if (status === "ARCHIVED" || status === "SOLD") {
    return "Archived";
  }

  return "Pending";
}

function readPrice(item: UnknownRecord) {
  if (typeof item.price === "number") {
    return item.price;
  }

  if (isRecord(item.pricing)) {
    return (
      getNumber(item.pricing.promotional) || getNumber(item.pricing.retail)
    );
  }

  return 0;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatAdded(value: string) {
  if (!value) {
    return "Added recently";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Added recently";
  }

  return `Added ${date.toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}
