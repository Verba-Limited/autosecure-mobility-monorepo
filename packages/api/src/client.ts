export const DEFAULT_PUBLIC_API_URL =
  "https://autosecure-public-api.onrender.com/api/v1";

export const DEFAULT_ADMIN_API_URL =
  "https://autosecure-admin-api.onrender.com/api/v1";

export type QueryValue = string | number | boolean | null | undefined;

export function toQueryString<T extends object>(values: T) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

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

export type ApiClientOptions = {
  onUnauthorized?: () => void;
  refreshAccessToken?: () => Promise<string | null>;
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
  private readonly refreshAccessToken?: () => Promise<string | null>;
  private refreshPromise: Promise<string | null> | null = null;
  private hasHandledUnauthorized = false;

  constructor(
    baseUrl: string,
    options: ApiClientOptions | (() => void) = {},
  ) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
    const normalizedOptions =
      typeof options === "function" ? { onUnauthorized: options } : options;
    this.onUnauthorized = normalizedOptions.onUnauthorized;
    this.refreshAccessToken = normalizedOptions.refreshAccessToken;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.performRequest<T>(path, options, true);
  }

  private async getRefreshedAccessToken() {
    if (!this.refreshAccessToken) return null;
    if (!this.refreshPromise) {
      this.refreshPromise = this.refreshAccessToken()
        .catch(() => null)
        .finally(() => {
          this.refreshPromise = null;
        });
    }
    return this.refreshPromise;
  }

  private handleUnauthorized() {
    if (this.hasHandledUnauthorized) return;
    this.hasHandledUnauthorized = true;
    this.onUnauthorized?.();
  }

  private async performRequest<T>(
    path: string,
    options: RequestOptions,
    mayRefresh: boolean,
  ): Promise<T> {
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
      if (response.status === 401) {
        if (mayRefresh && options.accessToken && this.refreshAccessToken) {
          const refreshedAccessToken = await this.getRefreshedAccessToken();
          if (refreshedAccessToken) {
            return this.performRequest<T>(
              path,
              { ...options, accessToken: refreshedAccessToken },
              false,
            );
          }
        }
        this.handleUnauthorized();
      }
      throw new ApiError(response.status, payload);
    }

    this.hasHandledUnauthorized = false;
    return payload as T;
  }
}

export function createPublicApiClient(
  baseUrl = DEFAULT_PUBLIC_API_URL,
  options?: ApiClientOptions | (() => void),
) {
  return new ApiClient(baseUrl, options);
}

export function createAdminApiClient(
  baseUrl = DEFAULT_ADMIN_API_URL,
  options?: ApiClientOptions | (() => void),
) {
  return new ApiClient(baseUrl, options);
}
