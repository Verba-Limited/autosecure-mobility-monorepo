"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Loader2 } from "lucide-react";
import { ListingsTable, type Listing } from "@/components/portal/ListingsTable";
import { QuickActionCard } from "@/components/portal/QuickActionCard";
import { PlanCard, StatCard } from "@/components/portal/StatCard";
import { supplierPortalApi } from "@/lib/supplier-api";
import { useSupplierProfile } from "@/hooks/useSupplierProfile";
import {
  getApiItems,
  getApiTotalItems,
  getDashboardNumber,
  mapListingRow,
  mapRecentListing,
  type PortalListingRow,
} from "@/lib/supplier-listing-mappers";

type InventoryBreakdown = {
  newCars: number;
  usedCars: number;
  parts: number;
  total: number;
};

function InventoryBreakdownCard({
  label,
  count,
  colorClass,
  href,
  isLoading,
}: {
  label: string;
  count: number;
  colorClass: string;
  href: string;
  isLoading: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl border border-portal-border bg-white px-5 py-4 transition-shadow hover:shadow-md"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        {isLoading ? (
          <div className="mt-2 h-8 w-10 animate-pulse rounded bg-slate-100" />
        ) : (
          <p className={`mt-1.5 text-2xl font-extrabold ${colorClass}`}>
            {count}
          </p>
        )}
      </div>
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${colorClass} bg-current/10`}
      >
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full opacity-10 ${colorClass.replace("text-", "bg-")}`}
        />
      </span>
    </Link>
  );
}

function StatSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-portal-border bg-white p-5">
      <div className="mb-3 h-3 w-24 rounded bg-slate-100" />
      <div className="h-8 w-16 rounded bg-slate-200" />
      <div className="mt-3 h-3 w-32 rounded bg-slate-100" />
    </div>
  );
}

function EmptyRecentListings() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-portal-border bg-white py-14 text-center">
      <ClipboardList className="mb-4 h-12 w-12 text-slate-300" />
      <p className="text-base font-bold text-portal-ink">No listings yet</p>
      <p className="mt-1.5 max-w-xs text-sm text-slate-400">
        You haven&apos;t listed any vehicles or parts. Get started by listing
        your first item.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/list-new-car"
          className="rounded-lg bg-portal-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-portal-blue-700"
        >
          List New Car
        </Link>
        <Link
          href="/list-used-car"
          className="rounded-lg border border-portal-border px-4 py-2 text-sm font-semibold text-portal-ink transition-colors hover:bg-slate-50"
        >
          List Used Car
        </Link>
      </div>
    </div>
  );
}

export function DashboardClient() {
  const { profile } = useSupplierProfile();
  const [dashboardPayload, setDashboardPayload] = useState<unknown>(null);
  const [listingsPayload, setListingsPayload] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const [dashboard, listings] = await Promise.all([
          supplierPortalApi.getDashboard(),
          supplierPortalApi.getListings(1, 10),
        ]);
        if (isMounted) {
          setDashboardPayload(dashboard);
          setListingsPayload(listings);
        }
      } catch {
        if (isMounted) {
          setDashboardPayload(null);
          setListingsPayload(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const recentListings = useMemo(() => {
    if (isLoading) return [];
    return getApiItems(listingsPayload)
      .map(mapRecentListing)
      .filter((listing): listing is Listing => listing !== null);
  }, [listingsPayload, isLoading]);

  const allMappedListings = useMemo(() => {
    return getApiItems(listingsPayload)
      .map(mapListingRow)
      .filter((l): l is PortalListingRow => l !== null);
  }, [listingsPayload]);

  const inventoryBreakdown = useMemo<InventoryBreakdown>(() => {
    const total = getApiTotalItems(listingsPayload) ?? allMappedListings.length;
    return {
      total,
      newCars: allMappedListings.filter((l) => l.category === "NEW CAR").length,
      usedCars: allMappedListings.filter((l) => l.category === "USED CAR")
        .length,
      parts: allMappedListings.filter((l) => l.category === "PART").length,
    };
  }, [allMappedListings, listingsPayload]);

  const totalListings =
    getDashboardNumber(dashboardPayload, [
      "totalListings",
      "listings",
      "inventoryCount",
    ]) ?? inventoryBreakdown.total;
  const totalViews =
    getDashboardNumber(dashboardPayload, ["totalViews", "views"]) ??
    recentListings.reduce((sum, l) => sum + l.views, 0);
  const totalLeads =
    getDashboardNumber(dashboardPayload, [
      "whatsAppLeads",
      "whatsappLeads",
      "totalLeads",
      "leads",
    ]) ?? 0;

  const displayName = profile?.businessName ?? "";
  const greeting = displayName
    ? `Welcome back, ${displayName}`
    : "Welcome back";

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-portal-ink sm:text-3xl">
          {greeting}
        </h1>
        <p className="mt-1.5 flex items-center gap-2 text-sm text-[#7B8DB0]">
          {isLoading && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-portal-blue-600" />
          )}
          {isLoading
            ? "Loading your supplier performance overview…"
            : "Here's your performance overview for this week."}
        </p>
      </div>

      {/* Stats Row */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <StatCard
              label="TOTAL LISTINGS"
              value={String(totalListings)}
              delta="Synced from inventory"
            />
            <StatCard
              label="TOTAL VIEWS"
              value={String(totalViews)}
              delta="Live catalog activity"
            />
            <StatCard
              label="WHATSAPP LEADS"
              value={String(totalLeads)}
              delta="Customer inquiries"
            />
            <PlanCard planName="Premium" renewsOn="July 30, 2026" />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-3 text-base font-bold text-portal-ink">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            label="List New Car"
            href="/list-new-car"
            iconSrc="/nav-icons/%F0%9F%9A%97.png"
          />
          <QuickActionCard
            label="List Used Car"
            href="/list-used-car"
            iconSrc="/nav-icons/%F0%9F%8F%B7%EF%B8%8F.png"
          />
          <QuickActionCard
            label="List a Part"
            href="/list-a-part"
            iconSrc="/nav-icons/%F0%9F%94%A7.png"
          />
          <QuickActionCard
            label="Manage Listings"
            href="/my-listings"
            iconSrc="/nav-icons/%F0%9F%93%8B.png"
          />
        </div>
      </div>

      {/* Inventory Breakdown */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-portal-ink">
            Inventory Breakdown
          </h2>
          <Link
            href="/my-listings"
            className="text-sm font-semibold text-portal-blue-600 hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InventoryBreakdownCard
            label="Brand New Cars"
            count={inventoryBreakdown.newCars}
            colorClass="text-portal-blue-600"
            href="/my-listings"
            isLoading={isLoading}
          />
          <InventoryBreakdownCard
            label="Used Cars"
            count={inventoryBreakdown.usedCars}
            colorClass="text-brand-green-600"
            href="/my-listings"
            isLoading={isLoading}
          />
          <InventoryBreakdownCard
            label="Parts"
            count={inventoryBreakdown.parts}
            colorClass="text-gold-600"
            href="/my-listings"
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Recent Listings */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-portal-ink">
            Recent Listings
          </h2>
          <Link
            href="/my-listings"
            className="text-sm font-semibold text-portal-blue-600 hover:underline"
          >
            View All
          </Link>
        </div>

        {isLoading ? (
          /* Full-page spinner while fetching */
          <div className="flex items-center justify-center rounded-xl border border-portal-border bg-white py-14">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-portal-blue-600" />
              <p className="text-sm font-medium text-slate-400">
                Fetching your listings…
              </p>
            </div>
          </div>
        ) : recentListings.length === 0 ? (
          <EmptyRecentListings />
        ) : (
          <ListingsTable
            title=""
            listings={recentListings}
            onViewAllHref="/my-listings"
          />
        )}
      </div>
    </>
  );
}
