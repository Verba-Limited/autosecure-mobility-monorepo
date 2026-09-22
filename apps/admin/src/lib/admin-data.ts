export type RecordValue = Record<string, unknown>;

export function record(value: unknown): RecordValue {
  return value && typeof value === "object" ? (value as RecordValue) : {};
}

export function unwrap(value: unknown): unknown {
  const item = record(value);
  return item.data ?? item.result ?? item.payload ?? value;
}

export function items(value: unknown): RecordValue[] {
  const unwrapped = unwrap(value);
  if (Array.isArray(unwrapped)) return unwrapped.map(record);
  const item = record(unwrapped);
  for (const key of ["items", "results", "listings", "suppliers", "data"]) {
    if (Array.isArray(item[key])) return (item[key] as unknown[]).map(record);
  }
  return [];
}

export function isRecord(value: unknown): value is RecordValue {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function text(value: unknown, fallback = "-"): string {
  if (value === null || value === undefined || value === "") return fallback;
  if (Array.isArray(value)) {
    for (const item of value) {
      const result = text(item, fallback);
      if (result !== fallback) return result;
    }
    return fallback;
  }
  if (isRecord(value)) {
    for (const key of ["name", "title", "companyName", "businessName", "contactPerson", "email", "contactEmail", "value", "label"]) {
      if (typeof value[key] === "string" && value[key] !== "") return value[key];
    }
    return fallback;
  }
  return String(value);
}

export function formatAdminDate(value: unknown): string {
  if (!value) return "-";
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime())
    ? text(value)
    : parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function numeric(value: unknown): number {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function pick(item: RecordValue, keys: string[], fallback = "-") {
  for (const key of keys) {
    if (item[key] !== undefined && item[key] !== null) return text(item[key], fallback);
  }
  return fallback;
}

export function itemIdFor(item: RecordValue, index: number) {
  return String(item._id ?? item.id ?? item.listingId ?? index);
}
