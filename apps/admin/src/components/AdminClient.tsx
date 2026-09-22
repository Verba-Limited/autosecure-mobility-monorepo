"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  FiCheck as Check,
  FiLoader as Loader2,
  FiSearch as Search,
  FiX as X,
  FiXCircle as XCircle,
  FiEye as Eye,
  FiChevronUp as ChevronUp,
} from "react-icons/fi";
import { adminApi, getAdminErrorMessage } from "@/lib/admin-api";
import { AdminEmptyState, AdminErrorState, AdminLoadingState } from "@/components/ui/AdminPrimitives";
import {
  formatAdminDate as date,
  itemIdFor,
  items,
  pick,
  record,
  text,
  unwrap,
  type RecordValue,
} from "@/lib/admin-data";
import { notifyError, notifySuccess } from "@/lib/admin-notifications";

export type AdminSection = "listings";

function StatusPill({ value }: { value: string }) {
  const normalized = value.toUpperCase();
  const style =
    normalized.includes("APPROV") || normalized.includes("ACTIVE")
      ? "bg-emerald-50 text-emerald-700"
      : normalized.includes("REJECT") || normalized.includes("SUSPEND")
        ? "bg-red-50 text-red-700"
        : "bg-amber-50 text-amber-700";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${style}`}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}

export function AdminClient({
  accessToken,
  initialStatus = "",
  initialQuery = "",
}: {
  accessToken: string;
  section: AdminSection;
  initialStatus?: string;
  initialQuery?: string;
}) {
  const [listingPayload, setListingPayload] = useState<unknown>(null);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [listingPage, setListingPage] = useState(1);
  const [query, setQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejecting, setRejecting] = useState<RecordValue | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionKey, setActionKey] = useState<string | null>(null);

  const loadData = useCallback(
    async (showPageLoader = true) => {
      if (showPageLoader) setIsLoading(true);
      setError("");
      try {
        setListingPayload(
          await adminApi.getListings(
            accessToken,
            statusFilter,
            listingPage,
            10,
          ),
        );
      } catch (requestError) {
        setError(getAdminErrorMessage(requestError));
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken, statusFilter, listingPage],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const allListings = useMemo(() => items(listingPayload), [listingPayload]);
  const listingMeta = useMemo(() => record(record(unwrap(listingPayload)).meta), [listingPayload]);
  const listings = useMemo(
    () =>
      allListings.filter((item) => {
        const matchesStatus =
          !statusFilter || pick(item, ["status"], "") === statusFilter;
        const matchesQuery =
          !query ||
          JSON.stringify(item).toLowerCase().includes(query.toLowerCase());
        return matchesStatus && matchesQuery;
      }),
    [allListings, query, statusFilter],
  );

  async function runAction(
    action: () => Promise<unknown>,
    success: string,
    key: string,
  ) {
    setError("");
    setActionKey(key);
    try {
      await action();
      notifySuccess(success);
      await loadData(false);
    } catch (requestError) {
      notifyError(getAdminErrorMessage(requestError));
    } finally {
      setActionKey(null);
    }
  }
  function itemId(item: RecordValue) {
    return text(item.id ?? item._id ?? item.listingId, "");
  }

  return (
    <>
          {error ? <div className="mb-5"><AdminErrorState message={error} onDismiss={() => setError("")} /></div> : null}
          {isLoading ? (
            <AdminLoadingState label="Loading operations data" />
          ) : (
            <ListingReview
              listings={listings}
              filter={statusFilter}
              setFilter={(value) => {
                setListingPage(1);
                setStatusFilter(value);
              }}
              query={query}
              setQuery={setQuery}
              itemId={itemId}
              actionKey={actionKey}
              onApprove={(id) =>
                runAction(
                  () => adminApi.approveListing(accessToken, id),
                  "Listing approved and published.",
                  `approve:${id}`,
                )
              }
              onReject={(item) => setRejecting(item)}
              currentPage={listingPage}
              totalPages={typeof listingMeta.totalPages === 'number' ? listingMeta.totalPages : 1}
              onPageChange={setListingPage}
            />
          )}
      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--admin-navy)]/60 p-5">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-red-600">
                  Reject listing
                </p>
                <h2 className="mt-2 font-display text-xl font-bold">
                  Give the supplier a clear reason
                </h2>
              </div>
              <button onClick={() => setRejecting(null)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              className="mt-6 min-h-32 w-full resize-none rounded-xl border border-[var(--admin-line)] p-3 text-sm outline-none focus:border-[var(--admin-gold)]"
              placeholder="What needs to change before this listing can go live?"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setRejecting(null)}
                className="rounded-lg px-4 py-2 text-sm font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                disabled={!rejectReason.trim()}
                onClick={() => {
                  const id = itemId(rejecting);
                  setRejecting(null);
                  void runAction(
                    () =>
                      adminApi.rejectListing(accessToken, id, {
                        reason: rejectReason.trim(),
                      }),
                    "Listing rejected with feedback.",
                    `reject:${id}`,
                  );
                  setRejectReason("");
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
              >
                Reject listing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ListingReview({
  listings,
  filter,
  setFilter,
  query,
  setQuery,
  itemId,
  actionKey,
  onApprove,
  onReject,
  currentPage,
  totalPages,
  onPageChange,
}: {
  listings: RecordValue[];
  filter: string;
  setFilter: (value: string) => void;
  query: string;
  setQuery: (value: string) => void;
  itemId: (item: RecordValue) => string;
  actionKey: string | null;
  onApprove: (id: string) => void;
  onReject: (item: RecordValue) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <SectionIntro
        title="Listings"
        description="Approve quality inventory or send it back with useful feedback."
      />
      <Toolbar query={query} setQuery={setQuery}>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="h-10 rounded-lg border border-[var(--admin-line)] bg-white px-3 text-sm font-semibold outline-none"
        >
          <option value="PENDING_REVIEW">Pending review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="">All statuses</option>
        </select>
      </Toolbar>
      {listings.length ? (
        <div className="overflow-x-auto rounded-2xl border border-[var(--admin-line)] bg-white">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[1.7fr_1fr_0.8fr_0.9fr_1fr] border-b border-[var(--admin-line)] bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
              <span>Listing</span>
              <span>Supplier</span>
              <span>Submitted</span>
              <span>Status</span>
              <span className="text-right">Decision</span>
            </div>
            {listings.map((item, index) => {
              const id = itemId(item) || itemIdFor(item, index);
              const isExpanded = expandedId === id;
              const images = item.images as string[] | undefined;
              const firstImage = images?.[0];
              const supplier = item.supplier as RecordValue | undefined;

              return (
                <div
                  key={id}
                  className="border-b border-[var(--admin-line)] last:border-0"
                >
                  <div className="grid grid-cols-[1.7fr_1fr_0.8fr_0.9fr_1fr] items-center px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      {firstImage ? (
                        <Image
                          src={firstImage}
                          alt="Thumbnail"
                          width={56}
                          height={40}
                          unoptimized
                          className="h-10 w-14 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-14 shrink-0 rounded bg-slate-100" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">
                          {pick(item, ["title", "name", "model"], "Untitled listing")}
                        </p>
                        <p className="mt-1 truncate text-xs text-[var(--admin-muted)]">
                          {pick(item, ["type", "category"], "Inventory")}
                        </p>
                      </div>
                    </div>
                    <p className="truncate text-sm text-slate-600">
                      {supplier?.companyName as string || pick(
                        item,
                        ["supplierName", "supplier"],
                        "Unknown supplier",
                      )}
                    </p>
                    <p className="text-xs text-slate-500">
                      {date(item.createdAt ?? item.submittedAt)}
                    </p>
                    <div>
                      <StatusPill
                        value={pick(item, ["status"], filter || "PENDING_REVIEW")}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        title="View details"
                        onClick={() => toggleExpand(id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      {pick(item, ["status"], filter) === "PENDING_REVIEW" && (
                        <>
                          <button
                            title="Approve listing"
                            disabled={actionKey === `approve:${id}`}
                            onClick={() => onApprove(id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          >
                            {actionKey === `approve:${id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            title="Reject listing"
                            onClick={() => onReject(item)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="bg-slate-50/50 px-5 py-5 text-sm">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="mb-3 font-bold text-slate-800">
                            Listing Details
                          </h4>
                          <ul className="space-y-1.5 text-slate-600">
                            <li>
                              <span className="font-semibold text-slate-900">Brand:</span>{" "}
                              {item.brand as string || "N/A"}
                            </li>
                            <li>
                              <span className="font-semibold text-slate-900">Model:</span>{" "}
                              {item.model as string || "N/A"}
                            </li>
                            <li>
                              <span className="font-semibold text-slate-900">Year:</span>{" "}
                              {item.year as number || "N/A"}
                            </li>
                            <li>
                              <span className="font-semibold text-slate-900">Condition:</span>{" "}
                              {item.condition as string || "N/A"}
                            </li>
                            <li>
                              <span className="font-semibold text-slate-900">Color:</span>{" "}
                              {item.color as string || "N/A"}
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="mb-3 font-bold text-slate-800">
                            Pricing & Stock
                          </h4>
                          <ul className="space-y-1.5 text-slate-600">
                            <li>
                              <span className="font-semibold text-slate-900">Retail Price:</span>{" "}
                              {(item.pricing as RecordValue)?.retail
                                ? Number((item.pricing as RecordValue).retail).toLocaleString()
                                : "N/A"}
                            </li>
                            <li>
                              <span className="font-semibold text-slate-900">Promotional:</span>{" "}
                              {(item.pricing as RecordValue)?.promotional
                                ? Number((item.pricing as RecordValue).promotional).toLocaleString()
                                : "None"}
                            </li>
                            <li>
                              <span className="font-semibold text-slate-900">In Stock:</span>{" "}
                              {item.inStock ? "Yes" : "No"}
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="mt-6">
                        <h4 className="mb-2 font-bold text-slate-800">Description</h4>
                        <p className="whitespace-pre-wrap leading-relaxed text-slate-600">
                          {item.description as string || "No description provided."}
                        </p>
                      </div>
                      {Array.isArray(item.keyFeatures) && item.keyFeatures.length > 0 && (
                        <div className="mt-6">
                          <h4 className="mb-2 font-bold text-slate-800">Key Features</h4>
                          <div className="flex flex-wrap gap-2">
                            {item.keyFeatures.map((feature, i) => (
                              <span key={i} className="rounded-md bg-slate-200/60 px-2 py-1 text-xs font-medium text-slate-700">
                                {String(feature)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {images && images.length > 0 && (
                        <div className="mt-6">
                          <h4 className="mb-3 font-bold text-slate-800">Images</h4>
                          <div className="flex gap-3 overflow-x-auto pb-2">
                            {images.map((img, i) => (
                              <a key={i} href={img} target="_blank" rel="noreferrer">
                                <Image
                                  src={img}
                                  alt={`Image ${i + 1}`}
                                  width={128}
                                  height={96}
                                  unoptimized
                                  className="h-24 w-32 shrink-0 rounded-lg border border-slate-200 object-cover shadow-sm transition hover:opacity-80"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[var(--admin-line)] px-5 py-4">
              <span className="text-sm font-semibold text-slate-500">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => onPageChange(currentPage - 1)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => onPageChange(currentPage + 1)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <AdminEmptyState title="No listings found" description="No listings match this review filter." />
      )}
    </>
  );
}

function SectionIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7">
      <h2 className="font-display text-3xl font-bold tracking-tight">
        {title}
      </h2>
      <p className="mt-2 text-sm text-[var(--admin-muted)]">{description}</p>
    </div>
  );
}
function Toolbar({
  query,
  setQuery,
  children,
}: {
  query: string;
  setQuery: (value: string) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-10 w-full rounded-lg border border-[var(--admin-line)] bg-white pl-9 pr-3 text-sm outline-none focus:border-[var(--admin-gold)]"
          placeholder="Search records"
        />
      </div>
      {children}
    </div>
  );
}
