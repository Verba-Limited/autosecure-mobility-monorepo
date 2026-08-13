"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ClipboardList, Edit, Loader2, Plus, Search, Trash2, Eye, ChevronUp } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { supplierPortalApi } from "@/lib/supplier-api";
import {
  getApiItems,
  getApiTotalItems,
  mapListingRow,
  type PortalListingRow,
} from "@/lib/supplier-listing-mappers";
import { EditListingModal } from "./EditListingModal";

const TYPE_STYLES = {
  "NEW CAR": "bg-portal-blue-600/10 text-portal-blue-600",
  "USED CAR": "bg-brand-green-500/10 text-emerald-700",
  PART: "bg-gold-100 text-gold-600",
};

const STATUS_STYLES = {
  Active: "text-emerald-600 bg-emerald-500",
  Pending: "text-amber-600 bg-amber-500",
  Archived: "text-slate-500 bg-slate-400",
};

type TabKey = "all" | "newCars" | "usedCars" | "parts";

const TABS: { key: TabKey; label: string; category?: PortalListingRow["category"] }[] = [
  { key: "all", label: "All" },
  { key: "newCars", label: "New Cars", category: "NEW CAR" },
  { key: "usedCars", label: "Used Cars", category: "USED CAR" },
  { key: "parts", label: "Parts", category: "PART" },
];

interface ListingIdentity {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
}

export function MyListingsClient() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabKey) || "all";

  const [payload, setPayload] = useState<unknown>(null);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState<number | null>(null);

  // Edit Listing state
  const [editingListing, setEditingListing] = useState<PortalListingRow | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this listing? This cannot be undone.")) return;
    try {
      await supplierPortalApi.deleteListing(id);
      setPayload((current: unknown) => {
        const items = getApiItems(current).filter((item) => {
          const record = item as ListingIdentity;
          return record._id !== id && record.id !== id;
        });
        return { data: { items } };
      });
      setTotalItems((current) => (current === null ? null : Math.max(0, current - 1)));
    } catch {
      window.alert("We could not delete this listing. Please try again.");
    }
  }

  function handleSavedListing(updated: PortalListingRow) {
    setPayload((current: unknown) => {
      const items = getApiItems(current).map((item) => {
        const record = item as ListingIdentity & Record<string, unknown>;
        if (record._id === updated.id || record.id === updated.id) {
          return {
            ...record,
            title: updated.name,
            name: updated.name,
            price: updated.price,
            category: updated.category,
            status: updated.status,
            condition: updated.condition,
            description: updated.description,
          };
        }
        return record;
      });
      return { data: { items } };
    });
  }

  useEffect(() => {
    let isMounted = true;

    async function loadListings() {
      try {
        const listings = await supplierPortalApi.getListings(1, 25);
        if (isMounted) {
          setPayload(listings);
          const total = getApiTotalItems(listings);
          if (total !== null) setTotalItems(total);
        }
      } catch {
        if (isMounted) {
          setPayload(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadListings();

    return () => {
      isMounted = false;
    };
  }, []);

  const allListings = useMemo(() => {
    return getApiItems(payload)
      .map(mapListingRow)
      .filter((listing): listing is PortalListingRow => listing !== null);
  }, [payload]);

  const counts = useMemo(
    () => ({
      all: totalItems ?? allListings.length,
      newCars: allListings.filter((l) => l.category === "NEW CAR").length,
      usedCars: allListings.filter((l) => l.category === "USED CAR").length,
      parts: allListings.filter((l) => l.category === "PART").length,
    }),
    [allListings, totalItems],
  );

  const listings = useMemo(() => {
    const activeTabDef = TABS.find((t) => t.key === activeTab);
    let filtered = allListings;

    if (activeTabDef?.category) {
      filtered = filtered.filter((l) => l.category === activeTabDef.category);
    }

    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery) {
      filtered = filtered.filter((listing) =>
        `${listing.name} ${listing.category} ${listing.status}`
          .toLowerCase()
          .includes(normalizedQuery),
      );
    }

    const sorted = [...filtered];
    if (sortBy === "price") {
      sorted.sort((a, b) => {
        const parsePrice = (priceStr: string) => {
          const num = Number(priceStr.replace(/[^0-9.-]+/g, ""));
          return isNaN(num) ? 0 : num;
        };
        return parsePrice(b.price) - parsePrice(a.price); // Descending (highest price first)
      });
    } else if (sortBy === "recent") {
      sorted.sort((a, b) => {
        const rawA = (a.rawItem as Record<string, unknown>) || {};
        const rawB = (b.rawItem as Record<string, unknown>) || {};
        const timeA = new Date((rawA.createdAt as string) || (rawA.updatedAt as string) || 0).getTime();
        const timeB = new Date((rawB.createdAt as string) || (rawB.updatedAt as string) || 0).getTime();
        return timeB - timeA;
      });
    }

    return sorted;
  }, [allListings, activeTab, query, sortBy]);

  return (
    <>
      {/* Edit Modal */}
      <EditListingModal
        listing={editingListing}
        isOpen={Boolean(editingListing)}
        onClose={() => setEditingListing(null)}
        onSaved={handleSavedListing}
      />

      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-portal-ink sm:text-3xl">
            My Listings
          </h1>
          <p className="mt-1.5 flex items-center gap-2 text-xs font-medium text-[#64748B] sm:text-sm">
            {isLoading && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-portal-blue-600" />
            )}
            {isLoading
              ? "Loading your listings…"
              : "View, edit, search, and manage all your active and draft listings."}
          </p>
        </div>
        <Link
          href="/list-new-car"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-portal-blue-600 px-5 text-sm font-bold text-white transition-colors hover:bg-portal-blue-700"
        >
          <Plus className="h-4 w-4" />
          List a Vehicle / Part
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-portal-border bg-white p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex w-full overflow-x-auto rounded-lg bg-slate-100 p-1 text-xs font-bold text-[#64748B] sm:w-auto sm:text-sm">
          {TABS.map((tab) => {
            const count = counts[tab.key];
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                id={`tab-${tab.key}`}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-md px-3.5 py-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-white text-portal-blue-600 shadow-sm"
                    : "hover:text-portal-ink"
                }`}
              >
                {tab.label}
                {" "}
                <span
                  className={`ml-0.5 text-xs ${
                    isActive ? "text-portal-blue-600" : "text-slate-400"
                  }`}
                >
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1 sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search vehicle or part..."
              className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm font-medium text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15 sm:w-64"
            />
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15"
          >
            <option value="recent">Sort by: Most Recent</option>
            <option value="price">Sort by: Price</option>
          </select>
        </div>
      </div>

      {/* Mobile Listing Cards (visible on screens < 768px) */}
      <div className="block space-y-4 md:hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-portal-border bg-white p-8">
            <Loader2 className="h-7 w-7 animate-spin text-portal-blue-600" />
            <span className="mt-3 text-sm font-medium text-slate-400">Fetching listings…</span>
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-portal-border bg-white p-8 text-center">
            <ClipboardList className="h-10 w-10 text-slate-300" />
            <p className="mt-2 text-sm font-bold text-portal-ink">
              {query ? "No results found" : "No listings yet"}
            </p>
          </div>
        ) : (
          listings.map((listing) => {
            const isExpanded = expandedId === listing.id;
            const raw = (listing.rawItem as Record<string, unknown>) || {};
            const images = raw.images as string[] | undefined;
            const firstImage = images?.[0];

            return (
              <div
                key={listing.id}
                className="rounded-xl border border-portal-border bg-white p-4 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt="Thumbnail"
                        className="h-10 w-10 shrink-0 rounded-lg border border-portal-border object-cover"
                      />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-portal-border bg-slate-100">
                        <Image
                          src={listing.iconSrc}
                          alt=""
                          width={22}
                          height={22}
                          aria-hidden="true"
                        />
                      </span>
                    )}
                    <div>
                      <h3 className="font-bold text-portal-ink">{listing.name}</h3>
                      <p className="text-xs text-slate-400">{listing.added}</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-md px-2.5 py-1 text-xs font-bold ${TYPE_STYLES[listing.category]}`}
                  >
                    {listing.category}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Price</p>
                    <p className="text-sm font-black text-portal-ink">{listing.price}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Views / Leads</p>
                    <p className="text-xs font-bold text-slate-700">
                      {listing.views} views • {listing.leads} leads
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Status</p>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-extrabold ${STATUS_STYLES[listing.status].split(" ")[0]}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${STATUS_STYLES[listing.status].split(" ")[1]}`}
                      />
                      {listing.status}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 rounded-lg bg-slate-50/50 p-4 text-sm border border-slate-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="mb-2 font-bold text-slate-800">Details</h4>
                        <ul className="space-y-1 text-slate-600 text-xs">
                          <li><span className="font-semibold text-slate-900">Brand:</span> {raw.brand as string || "N/A"}</li>
                          <li><span className="font-semibold text-slate-900">Model:</span> {raw.model as string || "N/A"}</li>
                          <li><span className="font-semibold text-slate-900">Year:</span> {raw.year as number || "N/A"}</li>
                          <li><span className="font-semibold text-slate-900">Condition:</span> {raw.condition as string || "N/A"}</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="mb-2 font-bold text-slate-800">Stock</h4>
                        <ul className="space-y-1 text-slate-600 text-xs">
                          <li><span className="font-semibold text-slate-900">In Stock:</span> {raw.inStock ? "Yes" : "No"}</li>
                        </ul>
                      </div>
                    </div>
                    {Array.isArray(raw.keyFeatures) && raw.keyFeatures.length > 0 && (
                      <div className="mt-4">
                        <h4 className="mb-2 font-bold text-slate-800 text-xs">Key Features</h4>
                        <div className="flex flex-wrap gap-2">
                          {raw.keyFeatures.map((feature, i) => (
                            <span key={i} className="rounded-md bg-slate-200/60 px-2 py-1 text-[10px] font-medium text-slate-700">
                              {String(feature)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {images && images.length > 0 && (
                      <div className="mt-4">
                        <h4 className="mb-2 font-bold text-slate-800 text-xs">Images</h4>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {images.map((img, i) => (
                            <img key={i} src={img} alt={`Image ${i + 1}`} className="h-16 w-24 shrink-0 rounded-md border border-slate-200 object-cover" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => toggleExpand(listing.id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-portal-ink hover:bg-slate-50"
                  >
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {isExpanded ? "Close" : "View"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingListing(listing)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-portal-ink hover:bg-slate-50"
                  >
                    <Edit className="h-3.5 w-3.5 text-portal-blue-600" />
                    Edit
                  </button>
                  {listing.status === "Pending" && (
                    <Link
                      href={`/my-listings/submit/${listing.id}`}
                      className="flex-1 text-center rounded-lg border border-portal-blue-600/30 bg-portal-blue-600/10 px-3 py-2 text-xs font-bold text-portal-blue-600"
                    >
                      Submit
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(listing.id)}
                    className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-2 text-red-500 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View (visible on screens >= 768px) */}
      <div className="hidden min-w-0 overflow-hidden rounded-xl border border-portal-border bg-white shadow-sm md:block">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1080px] table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[27%]" />
              <col className="w-[13%]" />
              <col className="w-[13%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
              <col className="w-[10%]" />
              <col className="w-[21%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-portal-border text-xs font-black uppercase tracking-wide text-[#64748B]">
                <th className="whitespace-nowrap px-6 py-5">Vehicle / Part</th>
                <th className="whitespace-nowrap px-6 py-5">Category</th>
                <th className="whitespace-nowrap px-6 py-5">Price</th>
                <th className="whitespace-nowrap px-6 py-5">Views</th>
                <th className="whitespace-nowrap px-6 py-5">Leads</th>
                <th className="whitespace-nowrap px-6 py-5">Status</th>
                <th className="whitespace-nowrap px-6 py-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-7 w-7 animate-spin text-portal-blue-600" />
                      <span className="text-sm font-medium text-slate-400">Fetching your listings…</span>
                    </div>
                  </td>
                </tr>
              ) : listings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <ClipboardList className="h-10 w-10 text-slate-300" />
                      <p className="text-sm font-bold text-portal-ink">
                        {query ? "No results found" : "No listings yet"}
                      </p>
                      <p className="text-sm text-slate-400">
                        {query
                          ? `No listings match "${query}". Try a different search.`
                          : "You haven't added any listings in this category yet."}
                      </p>
                      {!query && (
                        <Link
                          href="/list-new-car"
                          className="mt-2 rounded-lg bg-portal-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-portal-blue-700"
                        >
                          List your first vehicle
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                listings.map((listing) => {
                  const isExpanded = expandedId === listing.id;
                  const raw = (listing.rawItem as Record<string, unknown>) || {};
                  const images = raw.images as string[] | undefined;
                  const firstImage = images?.[0];

                  return (
                    <Fragment key={listing.id}>
                      <tr
                        className={`border-b border-portal-border ${isExpanded ? "bg-slate-50/50 border-b-0" : "last:border-b-0"}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex min-w-0 items-center gap-4">
                            {firstImage ? (
                              <img
                                src={firstImage}
                                alt="Thumbnail"
                                className="h-12 w-12 shrink-0 rounded-lg border border-portal-border object-cover"
                              />
                            ) : (
                              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-portal-border bg-slate-100">
                                <Image
                                  src={listing.iconSrc}
                                  alt=""
                                  width={24}
                                  height={24}
                                  aria-hidden="true"
                                />
                              </span>
                            )}
                            <span className="min-w-0">
                              <span className="block max-w-[210px] truncate whitespace-nowrap font-black text-portal-ink">
                                {listing.name}
                              </span>
                              <span className="block whitespace-nowrap text-xs font-semibold text-[#64748B]">
                                {listing.added}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-black ${TYPE_STYLES[listing.category]}`}
                          >
                            {listing.category}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 font-black text-portal-ink">
                          {listing.price}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 font-bold text-portal-ink">
                          {listing.views}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 font-bold text-portal-ink">
                          {listing.leads}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 text-sm font-black ${STATUS_STYLES[listing.status].split(" ")[0]}`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${STATUS_STYLES[listing.status].split(" ")[1]}`}
                            />
                            {listing.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => toggleExpand(listing.id)}
                              className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-1.5 text-xs font-black text-portal-ink hover:bg-slate-50"
                            >
                              {isExpanded ? <ChevronUp className="mr-1 h-3.5 w-3.5" /> : <Eye className="mr-1 h-3.5 w-3.5" />}
                              {isExpanded ? "Close" : "View"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingListing(listing)}
                              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-black text-portal-ink hover:bg-slate-50"
                            >
                              Edit
                            </button>
                            {listing.status === "Pending" && (
                              <Link
                                href={`/my-listings/submit/${listing.id}`}
                                className="rounded-md border border-portal-blue-600/30 bg-portal-blue-600/5 px-3 py-1.5 text-xs font-black text-portal-blue-600 hover:bg-portal-blue-600/10"
                              >
                                Submit
                              </Link>
                            )}
                            <button type="button" onClick={() => handleDelete(listing.id)} className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-black text-red-500 hover:bg-red-100">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="border-b border-portal-border bg-slate-50/50">
                          <td colSpan={7} className="px-6 py-6">
                            <div className="grid grid-cols-2 gap-8 lg:grid-cols-3">
                              <div className="col-span-2 lg:col-span-1">
                                <h4 className="mb-3 font-bold text-slate-800">
                                  Listing Details
                                </h4>
                                <ul className="space-y-1.5 text-sm text-slate-600">
                                  <li>
                                    <span className="font-semibold text-slate-900">Brand:</span>{" "}
                                    {raw.brand as string || "N/A"}
                                  </li>
                                  <li>
                                    <span className="font-semibold text-slate-900">Model:</span>{" "}
                                    {raw.model as string || "N/A"}
                                  </li>
                                  <li>
                                    <span className="font-semibold text-slate-900">Year:</span>{" "}
                                    {raw.year as number || "N/A"}
                                  </li>
                                  <li>
                                    <span className="font-semibold text-slate-900">Condition:</span>{" "}
                                    {raw.condition as string || "N/A"}
                                  </li>
                                  <li>
                                    <span className="font-semibold text-slate-900">Color:</span>{" "}
                                    {raw.color as string || "N/A"}
                                  </li>
                                </ul>
                              </div>
                              <div className="col-span-2 lg:col-span-2">
                                <h4 className="mb-2 font-bold text-slate-800">Description</h4>
                                <p className="whitespace-pre-wrap leading-relaxed text-sm text-slate-600">
                                  {raw.description as string || "No description provided."}
                                </p>
                                {Array.isArray(raw.keyFeatures) && raw.keyFeatures.length > 0 && (
                                  <div className="mt-5">
                                    <h4 className="mb-2 font-bold text-slate-800 text-sm">Key Features</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {raw.keyFeatures.map((feature, i) => (
                                        <span key={i} className="rounded-md bg-slate-200/60 px-2 py-1 text-xs font-medium text-slate-700">
                                          {String(feature)}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {images && images.length > 0 && (
                                  <div className="mt-5">
                                    <h4 className="mb-3 font-bold text-slate-800">Images</h4>
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                      {images.map((img, i) => (
                                        <a key={i} href={img} target="_blank" rel="noreferrer">
                                          <img
                                            src={img}
                                            alt={`Image ${i + 1}`}
                                            className="h-20 w-28 shrink-0 rounded-lg border border-slate-200 object-cover shadow-sm transition hover:opacity-80"
                                          />
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
