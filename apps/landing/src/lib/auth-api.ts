"use client";

import {
  createAuthApi,
  createPublicApiClient,
  DEFAULT_PUBLIC_API_URL,
} from "@autosecure/api";
import type { RegisterCustomerPayload } from "@autosecure/api";

export const CUSTOMER_EMAIL_KEY = "autosecure_customer_email";
export const CUSTOMER_ACCESS_TOKEN_KEY = "autosecure_customer_access_token";
export const CUSTOMER_REFRESH_TOKEN_KEY = "autosecure_customer_refresh_token";

const publicApiUrl =
  process.env.NEXT_PUBLIC_AUTOSECURE_PUBLIC_API_URL ?? DEFAULT_PUBLIC_API_URL;

export const authApi = createAuthApi(createPublicApiClient(publicApiUrl));

export type CustomerRegistrationPayload = RegisterCustomerPayload & {
  companyName: string;
};

export function saveCustomerSession(
  email: string,
  rawTokens: unknown,
) {
  const tokens = extractTokens(rawTokens);
  localStorage.setItem(CUSTOMER_EMAIL_KEY, email);
  if (tokens.accessToken) {
    localStorage.setItem(CUSTOMER_ACCESS_TOKEN_KEY, tokens.accessToken);
  }
  if (tokens.refreshToken) {
    localStorage.setItem(CUSTOMER_REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
}

export function getCustomerEmail() {
  return typeof window === "undefined"
    ? null
    : localStorage.getItem(CUSTOMER_EMAIL_KEY);
}

export function clearCustomerSession() {
  localStorage.removeItem(CUSTOMER_EMAIL_KEY);
  localStorage.removeItem(CUSTOMER_ACCESS_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_REFRESH_TOKEN_KEY);
}

function extractTokens(rawTokens: unknown) {
  const candidates = [
    rawTokens,
    typeof rawTokens === "object" && rawTokens !== null && "data" in rawTokens
      ? rawTokens.data
      : null,
  ];
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") continue;
    const value = candidate as Record<string, unknown>;
    const accessToken = value.accessToken ?? value.access_token ?? value.token;
    const refreshToken = value.refreshToken ?? value.refresh_token;
    if (typeof accessToken === "string" || typeof refreshToken === "string") {
      return {
        accessToken: typeof accessToken === "string" ? accessToken : null,
        refreshToken: typeof refreshToken === "string" ? refreshToken : null,
      };
    }
  }
  return { accessToken: null, refreshToken: null };
}

export function getAuthErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "payload" in error &&
    typeof error.payload === "object" &&
    error.payload !== null &&
    "message" in error.payload
  ) {
    const message = error.payload.message;
    return Array.isArray(message) ? message.join(", ") : String(message);
  }

  return "Something went wrong. Please try again.";
}

// ─── Customer Account, Order Tracking & Requests Models ───────────────────────

export type CustomerOrder = {
  id: string;
  orderNumber: string;
  vehicleName: string;
  image: string;
  orderDate: string;
  status:
    | "Order Confirmed"
    | "Vehicle Allocated"
    | "In Transit / Port Clearance"
    | "Delivered";
  progressStep: number; // 1 to 4
  estimatedDelivery: string;
  totalPrice: number;
  vin?: string;
  deliveryPortOrCity: string;
};

export type CustomerRequest = {
  id: string;
  referenceId: string;
  requestType:
    | "Custom Vehicle Import"
    | "Price Quote & Inspection"
    | "Auto Part Sourcing"
    | "Financing Assistance";
  vehicleOrItem: string;
  budgetRange?: string;
  notes?: string;
  status: "Under Review" | "Supplier Contacted" | "Quote Prepared" | "Completed";
  date: string;
};

export type CustomerProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
};

const ORDERS_KEY = "autosecure_customer_orders";
const REQUESTS_KEY = "autosecure_customer_requests";
const PROFILE_KEY = "autosecure_customer_profile";

const DEFAULT_ORDERS: CustomerOrder[] = [
  {
    id: "ord-1",
    orderNumber: "ASM-2025-0924",
    vehicleName: "2025 BMW 5 Series 530i (Alpine White)",
    image: "/images/cars/vichicle2.jpg",
    orderDate: "Sep 04, 2025",
    status: "In Transit / Port Clearance",
    progressStep: 3,
    estimatedDelivery: "Oct 12, 2025",
    totalPrice: 48_500_000,
    vin: "WBA530I99KL481920",
    deliveryPortOrCity: "Lagos Port / Victoria Island Delivery",
  },
  {
    id: "ord-2",
    orderNumber: "ASM-2024-8142",
    vehicleName: "2024 Toyota Land Cruiser Prado TX-L",
    image: "/images/cars/vehicle1.svg",
    orderDate: "Nov 18, 2024",
    status: "Delivered",
    progressStep: 4,
    estimatedDelivery: "Dec 14, 2024",
    totalPrice: 62_000_000,
    vin: "JTEPRADO88129031",
    deliveryPortOrCity: "Abuja Central Hub",
  },
];

const DEFAULT_REQUESTS: CustomerRequest[] = [
  {
    id: "req-1",
    referenceId: "REQ-9941",
    requestType: "Custom Vehicle Import",
    vehicleOrItem: "2025 Porsche Cayenne Coupe GTS (Carmine Red)",
    budgetRange: "₦110M – ₦130M",
    notes: "Requires panoramic roof, sport exhaust, and 21-inch RS Spyder wheels.",
    status: "Supplier Contacted",
    date: "Sep 10, 2025",
  },
  {
    id: "req-2",
    referenceId: "REQ-9812",
    requestType: "Auto Part Sourcing",
    vehicleOrItem: "OEM Brake Pad Set & Rotor Discs for Range Rover Sport 2024",
    budgetRange: "₦850,000",
    notes: "Front and rear axle complete kit.",
    status: "Quote Prepared",
    date: "Sep 02, 2025",
  },
];

export function getCustomerOrders(): CustomerOrder[] {
  if (typeof window === "undefined") return DEFAULT_ORDERS;
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(DEFAULT_ORDERS));
      return DEFAULT_ORDERS;
    }
    return JSON.parse(raw) as CustomerOrder[];
  } catch {
    return DEFAULT_ORDERS;
  }
}

export function getCustomerRequests(): CustomerRequest[] {
  if (typeof window === "undefined") return DEFAULT_REQUESTS;
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    if (!raw) {
      localStorage.setItem(REQUESTS_KEY, JSON.stringify(DEFAULT_REQUESTS));
      return DEFAULT_REQUESTS;
    }
    return JSON.parse(raw) as CustomerRequest[];
  } catch {
    return DEFAULT_REQUESTS;
  }
}

export function addCustomerRequest(
  data: Omit<CustomerRequest, "id" | "referenceId" | "date" | "status">,
): CustomerRequest {
  const current = getCustomerRequests();
  const newReq: CustomerRequest = {
    ...data,
    id: `req-${Date.now()}`,
    referenceId: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    status: "Under Review",
  };
  const updated = [newReq, ...current];
  if (typeof window !== "undefined") {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(updated));
  }
  return newReq;
}

export function getCustomerProfile(): CustomerProfile {
  const email = getCustomerEmail() || "customer@autosecure.ng";
  if (typeof window === "undefined") {
    return { firstName: "Verified", lastName: "Customer", email };
  }
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      return { ...JSON.parse(raw), email };
    }
  } catch {}
  return {
    firstName: "Verified",
    lastName: "Customer",
    email,
    phone: "+234 803 123 4567",
    city: "Lagos",
    state: "Lagos State",
    country: "Nigeria",
  };
}

export function saveCustomerProfile(profile: Partial<CustomerProfile>): void {
  if (typeof window === "undefined") return;
  const current = getCustomerProfile();
  const updated = { ...current, ...profile };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
}
