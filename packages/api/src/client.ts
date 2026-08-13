export const DEFAULT_PUBLIC_API_URL =
  "https://autosecure-public-api.onrender.com/api/v1";

export const DEFAULT_ADMIN_API_URL =
  "https://autosecure-admin-api.onrender.com/api/v1";

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, payload: unknown) {
    super(`API request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  accessToken?: string;
  body?: unknown;
};

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly onUnauthorized?: () => void;

  constructor(baseUrl: string, onUnauthorized?: () => void) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
    this.onUnauthorized = onUnauthorized;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const headers = new Headers(options.headers);

    if (options.accessToken) {
      headers.set("Authorization", `Bearer ${options.accessToken}`);
    }

    const isFormData =
      typeof FormData !== "undefined" && options.body instanceof FormData;

    if (options.body !== undefined && !isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${this.baseUrl}${normalizePath(path)}`, {
      ...options,
      headers,
      body:
        options.body === undefined || isFormData
          ? (options.body as BodyInit | undefined)
          : JSON.stringify(options.body),
    });

    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      if (response.status === 401 && this.onUnauthorized) {
        this.onUnauthorized();
      }
      throw new ApiError(response.status, payload);
    }

    return payload as T;
  }
}

export function createPublicApiClient(baseUrl = DEFAULT_PUBLIC_API_URL, onUnauthorized?: () => void) {
  return new ApiClient(baseUrl, onUnauthorized);
}

export function createAdminApiClient(baseUrl = DEFAULT_ADMIN_API_URL, onUnauthorized?: () => void) {
  return new ApiClient(baseUrl, onUnauthorized);
}
