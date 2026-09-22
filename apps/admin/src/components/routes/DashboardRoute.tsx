"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { IconType } from "react-icons";
import {
  FiArrowRight,
  FiClipboard,
  FiEye,
  FiMessageCircle,
  FiRefreshCw,
  FiShoppingBag,
  FiTrendingUp,
  FiUser,
} from "react-icons/fi";
import type { AdminDashboard, AdminReports } from "@autosecure/api";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminPageHeader,
} from "@/components/ui/AdminPrimitives";
import { adminApi, getAdminErrorMessage } from "@/lib/admin-api";
import { useAdminAuthStore } from "@/stores/auth-store";

export function DashboardRoute() {
  const accessToken = useAdminAuthStore((state) => state.accessToken);
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [reports, setReports] = useState<AdminReports | null>(null);
  const [dashboardError, setDashboardError] = useState("");
  const [reportsError, setReportsError] = useState("");
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [areReportsLoading, setAreReportsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    if (!accessToken) return;
    setIsDashboardLoading(true);
    setDashboardError("");
    try {
      const response = await adminApi.getDashboard(accessToken);
      setDashboard(response.data);
    } catch (error) {
      setDashboardError(getAdminErrorMessage(error));
    } finally {
      setIsDashboardLoading(false);
    }
  }, [accessToken]);

  const loadReports = useCallback(async () => {
    if (!accessToken) return;
    setAreReportsLoading(true);
    setReportsError("");
    try {
      const response = await adminApi.getReports(accessToken);
      setReports(response.data);
    } catch (error) {
      setReportsError(getAdminErrorMessage(error));
    } finally {
      setAreReportsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDashboard();
      void loadReports();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard, loadReports]);

  const listingStatuses = useMemo(
    () =>
      Object.entries(dashboard?.listings ?? {})
        .map(([status, count]) => [status, count ?? 0] as const)
        .sort(([first], [second]) => first.localeCompare(second)),
    [dashboard],
  );
  const totalListings = listingStatuses.reduce(
    (total, [, count]) => total + count,
    0,
  );

  return (
    <>
      <AdminPageHeader
        title="Marketplace overview"
        description="Monitor marketplace volume, customer demand, and supplier activity."
        actions={
          <button
            type="button"
            onClick={() => {
              void loadDashboard();
              void loadReports();
            }}
            disabled={isDashboardLoading || areReportsLoading}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--admin-line)] bg-white px-4 text-sm font-bold text-[var(--admin-ink)] hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
          >
            <FiRefreshCw
              className={isDashboardLoading || areReportsLoading ? "animate-spin" : ""}
              aria-hidden="true"
            />
            Refresh
          </button>
        }
      />

      <section aria-labelledby="marketplace-summary-heading">
        <h2 id="marketplace-summary-heading" className="sr-only">
          Marketplace summary
        </h2>
        {isDashboardLoading && !dashboard ? (
          <AdminLoadingState label="Loading dashboard totals" />
        ) : dashboardError && !dashboard ? (
          <AdminErrorState message={dashboardError} onRetry={() => void loadDashboard()} />
        ) : dashboard ? (
          <>
            {dashboardError ? (
              <div className="mb-5">
                <AdminErrorState message={dashboardError} onRetry={() => void loadDashboard()} />
              </div>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Listings"
                value={totalListings}
                detail="Across every listing status"
                icon={FiClipboard}
                href="/listings"
                tone="blue"
              />
              <MetricCard
                label="Suppliers"
                value={dashboard.suppliers}
                detail="Registered supplier accounts"
                icon={FiShoppingBag}
                href="/suppliers"
                tone="green"
              />
              <MetricCard
                label="Customers"
                value={dashboard.customers}
                detail="Registered customer accounts"
                icon={FiUser}
                tone="gold"
              />
              <MetricCard
                label="Inquiries"
                value={dashboard.inquiries}
                detail="Customer inquiries received"
                icon={FiMessageCircle}
                tone="red"
              />
            </div>

            <section className="mt-6 rounded-2xl border border-[var(--admin-line)] bg-white p-5 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold">Listing status</h2>
                  <p className="mt-1 text-sm text-[var(--admin-muted)]">
                    Open a status to view the matching moderation queue.
                  </p>
                </div>
                <Link
                  href="/listings"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[var(--admin-navy)] hover:underline"
                >
                  View all listings <FiArrowRight aria-hidden="true" />
                </Link>
              </div>
              {listingStatuses.length ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {listingStatuses.map(([status, count]) => (
                    <Link
                      key={status}
                      href={`/listings?status=${encodeURIComponent(status)}`}
                      className="flex items-center justify-between rounded-xl border border-[var(--admin-line)] px-4 py-3 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-gold)]"
                    >
                      <span className="text-sm font-semibold">
                        {formatLabel(status)}
                      </span>
                      <span className="text-lg font-bold">{count}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mt-5">
                  <AdminEmptyState title="No listing totals available" />
                </div>
              )}
            </section>
          </>
        ) : null}
      </section>

      <section aria-labelledby="reports-heading" className="mt-8">
        <div className="mb-4">
          <h2 id="reports-heading" className="font-display text-2xl font-bold">
            Reports
          </h2>
          <p className="mt-1 text-sm text-[var(--admin-muted)]">
            Product attention, inquiry activity, and supplier contribution.
          </p>
        </div>
        {areReportsLoading && !reports ? (
          <AdminLoadingState label="Loading dashboard reports" />
        ) : reportsError && !reports ? (
          <AdminErrorState message={reportsError} onRetry={() => void loadReports()} />
        ) : reports ? (
          <>
            {reportsError ? (
              <div className="mb-5">
                <AdminErrorState message={reportsError} onRetry={() => void loadReports()} />
              </div>
            ) : null}
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <MostViewedProducts products={reports.mostViewedProducts} />
              <InquiryActivity points={reports.inquiriesOverTime} />
            </div>
            <div className="mt-6">
              <SupplierLeaderboard suppliers={reports.supplierLeaderboard} />
            </div>
          </>
        ) : null}
      </section>
    </>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  href,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  icon: IconType;
  href?: string;
  tone: "blue" | "green" | "gold" | "red";
}) {
  const tones = {
    blue: "bg-[#eaf0ff] text-[#3158c9]",
    green: "bg-[#e8f8ef] text-[#21864a]",
    gold: "bg-[#fff6df] text-[#a87513]",
    red: "bg-[#fff0ee] text-[#c8463b]",
  };
  const content = (
    <>
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--admin-muted)]">
          {label}
        </p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-5 font-display text-3xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-[var(--admin-muted)]">{detail}</p>
    </>
  );
  const className =
    "rounded-2xl border border-[var(--admin-line)] bg-white p-5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-gold)]";
  return href ? (
    <Link href={href} className={`${className} hover:border-slate-300 hover:shadow-sm`}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

function MostViewedProducts({ products }: { products: AdminReports["mostViewedProducts"] }) {
  return (
    <section className="overflow-x-auto rounded-2xl border border-[var(--admin-line)] bg-white">
      <div className="flex items-center justify-between border-b border-[var(--admin-line)] px-5 py-4">
        <div>
          <h3 className="font-display text-lg font-bold">Most viewed products</h3>
          <p className="mt-1 text-xs text-[var(--admin-muted)]">Ranked by listing views</p>
        </div>
        <FiEye className="text-[var(--admin-gold)]" aria-hidden="true" />
      </div>
      {products.length ? (
        <div className="min-w-[620px]">
          <div className="grid grid-cols-[1fr_0.55fr_0.4fr_0.2fr] gap-4 bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--admin-muted)]">
            <span>Product</span><span>Type</span><span>Status</span><span className="text-right">Views</span>
          </div>
          {products.slice(0, 7).map((product) => (
            <Link
              key={product._id}
              href={`/listings?query=${encodeURIComponent(product.title)}`}
              className="grid grid-cols-[1fr_0.55fr_0.4fr_0.2fr] gap-4 border-t border-[var(--admin-line)] px-5 py-4 text-sm hover:bg-slate-50"
            >
              <span className="truncate font-semibold">{product.title}</span>
              <span className="text-[var(--admin-muted)]">{formatLabel(product.type)}</span>
              <span className="text-[var(--admin-muted)]">{formatLabel(product.status)}</span>
              <span className="text-right font-bold">{product.views}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-5"><AdminEmptyState title="No product view data" /></div>
      )}
    </section>
  );
}

function InquiryActivity({ points }: { points: AdminReports["inquiriesOverTime"] }) {
  const visiblePoints = points.slice(0, 8);
  const maximum = Math.max(...visiblePoints.map((point) => point.count), 1);
  return (
    <section className="rounded-2xl border border-[var(--admin-line)] bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold">Inquiry activity</h3>
          <p className="mt-1 text-xs text-[var(--admin-muted)]">Most recent reported days</p>
        </div>
        <FiTrendingUp className="text-[var(--admin-gold)]" aria-hidden="true" />
      </div>
      {visiblePoints.length ? (
        <div className="mt-6 space-y-4">
          {visiblePoints.map((point) => (
            <div key={point._id} className="grid grid-cols-[5.5rem_1fr_2rem] items-center gap-3">
              <span className="text-xs text-[var(--admin-muted)]">{formatDate(point._id)}</span>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[var(--admin-gold)]"
                  style={{ width: `${Math.max((point.count / maximum) * 100, 4)}%` }}
                  role="img"
                  aria-label={`${point.count} inquiries on ${formatDate(point._id)}`}
                />
              </div>
              <span className="text-right text-sm font-bold">{point.count}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5"><AdminEmptyState title="No inquiry history" /></div>
      )}
    </section>
  );
}

function SupplierLeaderboard({ suppliers }: { suppliers: AdminReports["supplierLeaderboard"] }) {
  return (
    <section className="rounded-2xl border border-[var(--admin-line)] bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold">Supplier leaderboard</h3>
          <p className="mt-1 text-xs text-[var(--admin-muted)]">Suppliers ranked by listing contribution</p>
        </div>
        <Link href="/suppliers" className="text-sm font-bold text-[var(--admin-navy)] hover:underline">
          View suppliers
        </Link>
      </div>
      {suppliers.length ? (
        <div className="mt-5 divide-y divide-[var(--admin-line)]">
          {suppliers.map((supplier, index) => (
            <Link
              key={`${supplier._id}-${index}`}
              href={`/suppliers?query=${encodeURIComponent(supplier.companyName || supplier.email)}`}
              className="flex items-center gap-4 py-4 hover:bg-slate-50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-[var(--admin-navy)]">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{supplier.companyName || "Unnamed supplier"}</span>
                <span className="block truncate text-xs text-[var(--admin-muted)]">{supplier.email}</span>
              </span>
              <span className="text-right">
                <span className="block text-lg font-bold">{supplier.count}</span>
                <span className="block text-[11px] text-[var(--admin-muted)]">Listings</span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-5"><AdminEmptyState title="No supplier activity" /></div>
      )}
    </section>
  );
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}
