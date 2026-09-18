import type { ApiClient } from "./client";
import type {
  CatalogComparisonResponse,
  CatalogContactChannels,
  CatalogFiltersResponse,
  CatalogHomeResponse,
  CatalogPopularBrand,
  CatalogSearchResponse,
  CatalogSellerContact,
  CatalogTerm,
  CatalogTrim,
  CatalogUseCase,
  InquiryPayload,
  InquiryResponse,
} from "./types";

type CatalogQuery = Record<string, string | number | boolean | undefined>;

function toQueryString(query?: CatalogQuery) {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export function createCatalogApi(client: ApiClient) {
  return {
    /**
     * Home screen payload: categories, hot deals, featured, banners, popular brands, use cases
     * GET /catalog/home
     */
    getHome() {
      return client.request<CatalogHomeResponse>("/catalog/home");
    },

    /**
     * Vehicles and parts currently promoted as Hot Deals (admin controlled)
     * GET /catalog/hot-deals
     */
    getHotDeals(query?: { limit?: number }) {
      return client.request<unknown[]>(`/catalog/hot-deals${toQueryString(query)}`);
    },

    /**
     * Universal search across cars, parts and brands
     * GET /catalog/search
     */
    search(query: { q: string } & CatalogQuery) {
      return client.request<CatalogSearchResponse>(`/catalog/search${toQueryString(query)}`);
    },

    /**
     * Browse and filter approved vehicles
     * GET /catalog/vehicles
     */
    getVehicles(query?: CatalogQuery) {
      return client.request(`/catalog/vehicles${toQueryString(query)}`);
    },

    /**
     * Featured vehicles for the home screen
     * GET /catalog/vehicles/featured
     */
    getFeaturedVehicles(query?: { limit?: number }) {
      return client.request<unknown[]>(`/catalog/vehicles/featured${toQueryString(query)}`);
    },

    /**
     * Compare up to 4 vehicles side by side (login required)
     * GET /catalog/vehicles/compare
     */
    compareVehicles(query?: { ids?: string; trimIds?: string }) {
      return client.request<CatalogComparisonResponse>(
        `/catalog/vehicles/compare${toQueryString(query as CatalogQuery)}`,
      );
    },

    /**
     * Vehicle listing detail
     * GET /catalog/vehicles/:id
     */
    getVehicle(id: string) {
      return client.request(`/catalog/vehicles/${encodeURIComponent(id)}`);
    },

    /**
     * Enquire about a vehicle (returns an AutoSecure WhatsApp link)
     * POST /catalog/vehicles/:id/inquire
     */
    inquireVehicle(id: string, payload: Partial<InquiryPayload> | Record<string, unknown>) {
      return client.request<InquiryResponse>(
        `/catalog/vehicles/${encodeURIComponent(id)}/inquire`,
        {
          method: "POST",
          body: payload,
        },
      );
    },

    /**
     * Browse and filter approved parts, tyres, batteries and accessories
     * GET /catalog/parts
     */
    getParts(query?: CatalogQuery) {
      return client.request(`/catalog/parts${toQueryString(query)}`);
    },

    /**
     * Part / tyre / battery / accessory listing detail
     * GET /catalog/parts/:id
     */
    getPart(id: string) {
      return client.request(`/catalog/parts/${encodeURIComponent(id)}`);
    },

    /**
     * Enquire about a part (returns an AutoSecure WhatsApp link)
     * POST /catalog/parts/:id/inquire
     */
    inquirePart(id: string, payload: Partial<InquiryPayload> | Record<string, unknown>) {
      return client.request<InquiryResponse>(
        `/catalog/parts/${encodeURIComponent(id)}/inquire`,
        {
          method: "POST",
          body: payload,
        },
      );
    },

    /**
     * Available filter options (with live counts) for the filter bar
     * GET /catalog/filters
     */
    getFilters(query?: { scope?: "VEHICLE" | "PART" | string; category?: string }) {
      return client.request<CatalogFiltersResponse>(
        `/catalog/filters${toQueryString(query as CatalogQuery)}`,
      );
    },

    /**
     * Intended-use options (family car, city driving, ...) with counts
     * GET /catalog/use-cases
     */
    getUseCases() {
      return client.request<CatalogUseCase[]>("/catalog/use-cases");
    },

    /**
     * Admin-managed classification terms (brands, body types, powertrains, ...)
     * GET /catalog/taxonomy
     */
    getTaxonomy(query?: { kind?: string; parent?: string }) {
      return client.request<CatalogTerm[]>(
        `/catalog/taxonomy${toQueryString(query as CatalogQuery)}`,
      );
    },

    /**
     * All active vehicle brands
     * GET /catalog/brands
     */
    getBrands() {
      return client.request<CatalogTerm[]>("/catalog/brands");
    },

    /**
     * Most-listed brands with live counts
     * GET /catalog/brands/popular
     */
    getPopularBrands(query?: { limit?: number }) {
      return client.request<CatalogPopularBrand[]>(
        `/catalog/brands/popular${toQueryString(query as CatalogQuery)}`,
      );
    },

    /**
     * Models for a brand
     * GET /catalog/brands/:brandSlug/models
     */
    getBrandModels(brandSlug: string) {
      return client.request<CatalogTerm[]>(
        `/catalog/brands/${encodeURIComponent(brandSlug)}/models`,
      );
    },

    /**
     * Published catalogue trims for a model
     * GET /catalog/models/:modelSlug/trims
     */
    getModelTrims(modelSlug: string, query?: { year?: number | string }) {
      return client.request<CatalogTrim[]>(
        `/catalog/models/${encodeURIComponent(modelSlug)}/trims${toQueryString(query as CatalogQuery)}`,
      );
    },

    /**
     * Search published catalogue vehicles (review pages)
     * GET /catalog/trims
     */
    getTrims(query?: CatalogQuery) {
      return client.request<{ items: CatalogTrim[]; meta?: unknown }>(
        `/catalog/trims${toQueryString(query)}`,
      );
    },

    /**
     * Vehicle profile/review page: specs, review, live listings and alternatives
     * GET /catalog/trims/:trimSlug
     */
    getTrim(trimSlug: string) {
      return client.request<CatalogTrim>(
        `/catalog/trims/${encodeURIComponent(trimSlug)}`,
      );
    },

    /**
     * AutoSecure's contact channels
     * GET /catalog/contact
     */
    getContact() {
      return client.request<CatalogContactChannels>("/catalog/contact");
    },

    /**
     * Contact channels for a listing (Always AutoSecure)
     * GET /catalog/listings/:listingId/seller-contact
     */
    getListingSellerContact(listingId: string) {
      return client.request<CatalogSellerContact>(
        `/catalog/listings/${encodeURIComponent(listingId)}/seller-contact`,
      );
    },

    /**
     * Configuration items (e.g. Brands, Models) for dropdowns (legacy)
     * GET /catalog/config
     */
    getConfig(query?: { type?: string }) {
      return client.request(`/catalog/config${toQueryString(query as CatalogQuery)}`);
    },

    /**
     * Supplier inventory (requires supplier auth)
     * GET /inventory
     */
    getInventory(query?: CatalogQuery) {
      return client.request(`/inventory${toQueryString(query)}`);
    },
  };
}