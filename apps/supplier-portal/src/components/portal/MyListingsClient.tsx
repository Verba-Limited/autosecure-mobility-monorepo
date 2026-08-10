"use client";

import Image from "next/image";
import Link from "next/link";
import { ClipboardList, Loader2, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supplierPortalApi } from "@/lib/supplier-api";
import {
  getApiItems,
  getApiTotalItems,
  mapListingRow,
  type PortalListingRow,
} from "@/lib/supplier-listing-mappers";

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

// No dummy fallback data — empty state UI is shown instead

interface ListingIdentity {
  _id?: string;
  id?: string;
}

export function MyListingsClient() {
  const [payload, setPayload] = useState<unknown>(null);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState<number | null>(null);

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

  // All listings (unfiltered by tab) for counts
  const allListings = useMemo(() => {
    return getApiItems(payload)
      .map(mapListingRow)
      .filter((listing): listing is PortalListingRow => listing !== null);
  }, [payload]);

  // Tab counts always reflect the full list (not the search query)
  const counts = useMemo(
    () => ({
      all: totalItems ?? allListings.length,
      newCars: allListings.filter((l) => l.category === "NEW CAR").length,
      usedCars: allListings.filter((l) => l.category === "USED CAR").length,
      parts: allListings.filter((l) => l.category === "PART").length,
    }),
    [allListings, totalItems],
  );

  // Apply tab filter then search query
  const listings = useMemo(() => {
    const activeTabDef = TABS.find((t) => t.key === activeTab);
    let filtered = allListings;

    if (activeTabDef?.category) {
      filtered = filtered.filter((l) => l.category === activeTabDef.category);
    }

    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return filtered;

    return filtered.filter((listing) =>
      `${listing.name} ${listing.category} ${listing.status}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [allListings, activeTab, query]);

  return (
    <>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-portal-ink">
            My Listings
          </h1>
          <p className="mt-1.5 flex items-center gap-2 text-sm font-medium text-[#64748B]">
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

      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-portal-border bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex w-full rounded-lg bg-slate-100 p-1 text-sm font-bold text-[#64748B] sm:w-auto">
          {TABS.map((tab) => {
            const count = counts[tab.key];
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                id={`tab-${tab.key}`}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-md px-4 py-2 whitespace-nowrap transition-colors ${
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
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search vehicle or part..."
              className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm font-medium text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15 sm:w-64"
            />
          </label>
          <select className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15">
            <option>Sort by: Most Recent</option>
            <option>Sort by: Most Viewed</option>
            <option>Sort by: Price</option>
          </select>
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-xl border border-portal-border bg-white shadow-sm">
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
                listings.map((listing) => (
                  <tr
                    key={listing.id}
                    className="border-b border-portal-border last:border-b-0"
                  >
                    <td className="px-6 py-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-portal-border bg-slate-100">
                          <Image
                            src={listing.iconSrc}
                            alt=""
                            width={24}
                            height={24}
                            aria-hidden="true"
                          />
                        </span>
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
                        <button className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-black text-portal-ink hover:bg-slate-50">
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
                        <button className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-black text-portal-ink hover:bg-slate-50">
                          Mark Sold
                        </button>
                        <button type="button" onClick={() => handleDelete(listing.id)} className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-black text-red-500 hover:bg-red-100">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
