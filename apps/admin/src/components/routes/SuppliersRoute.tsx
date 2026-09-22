"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiHome,
  FiMail,
  FiMapPin,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiSlash,
  FiUser,
  FiX,
} from "react-icons/fi";
import type {
  AdminSupplier,
  AdminSupplierStatus,
  PaginatedData,
} from "@autosecure/api";
import {
  AdminConfirmationDialog,
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminPageHeader,
} from "@/components/ui/AdminPrimitives";
import { adminApi, getAdminErrorMessage } from "@/lib/admin-api";
import { notifyError, notifySuccess } from "@/lib/admin-notifications";
import { useAdminAuthStore } from "@/stores/auth-store";

type PendingStatusChange = {
  supplier: AdminSupplier;
  status: Extract<AdminSupplierStatus, "ACTIVE" | "SUSPENDED">;
};

export function SuppliersRoute({ initialQuery = "" }: { initialQuery?: string }) {
  const accessToken = useAdminAuthStore((state) => state.accessToken);
  const [data, setData] = useState<PaginatedData<AdminSupplier> | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState<AdminSupplierStatus | "">("");
  const [selectedSupplier, setSelectedSupplier] = useState<AdminSupplier | null>(null);
  const [pendingChange, setPendingChange] = useState<PendingStatusChange | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  const loadSuppliers = useCallback(
    async (showLoader = true) => {
      if (!accessToken) return;
      if (showLoader) setIsLoading(true);
      setError("");
      try {
        const response = await adminApi.getSuppliers(accessToken, page, limit);
        setData(response.data);
      } catch (requestError) {
        setError(getAdminErrorMessage(requestError));
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken, limit, page],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => void loadSuppliers(), 0);
    return () => window.clearTimeout(timer);
  }, [loadSuppliers]);

  useEffect(() => {
    if (!selectedSupplier) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedSupplier(null);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [selectedSupplier]);

  const visibleSuppliers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return (data?.items ?? []).filter((supplier) => {
      const matchesStatus = !status || supplier.status === status;
      const matchesQuery =
        !normalizedQuery ||
        [
          supplier.companyName,
          supplier.email,
          supplier.firstName,
          supplier.lastName,
          supplier.phone,
        ]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(normalizedQuery));
      return matchesStatus && matchesQuery;
    });
  }, [data, query, status]);

  async function confirmStatusChange() {
    if (!pendingChange || !accessToken) return;
    setIsUpdating(true);
    try {
      await adminApi.updateSupplierStatus(
        accessToken,
        pendingChange.supplier._id,
        pendingChange.status,
      );
      notifySuccess(
        pendingChange.status === "ACTIVE"
          ? "Supplier account activated."
          : "Supplier account suspended.",
      );
      setPendingChange(null);
      setSelectedSupplier(null);
      await loadSuppliers(false);
    } catch (requestError) {
      notifyError(getAdminErrorMessage(requestError));
    } finally {
      setIsUpdating(false);
    }
  }

  const meta = data?.meta;
  const startItem = meta && meta.totalItems > 0 ? (meta.currentPage - 1) * meta.itemsPerPage + 1 : 0;
  const endItem = meta ? startItem + meta.itemCount - 1 : 0;

  return (
    <>
      <AdminPageHeader
        title="Supplier administration"
        description="Review supplier accounts, inspect business details, and control marketplace access."
        actions={
          <button
            type="button"
            onClick={() => void loadSuppliers()}
            disabled={isLoading}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--admin-line)] bg-white px-4 text-sm font-bold hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
          >
            <FiRefreshCw className={isLoading ? "animate-spin" : ""} aria-hidden="true" />
            Refresh
          </button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-[var(--admin-line)] bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <label className="relative block w-full sm:max-w-sm">
            <span className="sr-only">Search suppliers on this page</span>
            <FiSearch className="absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 w-full rounded-lg border border-[var(--admin-line)] pl-9 pr-3 text-sm outline-none focus:border-[var(--admin-gold)] focus:ring-4 focus:ring-[var(--admin-gold)]/15"
              placeholder="Search this page"
            />
          </label>
          <label>
            <span className="sr-only">Filter suppliers by status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as AdminSupplierStatus | "")}
              className="h-10 w-full rounded-lg border border-[var(--admin-line)] bg-white px-3 text-sm font-semibold outline-none focus:border-[var(--admin-gold)] sm:w-44"
            >
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </label>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--admin-muted)]">
          <span>Search and status filters apply to the loaded page.</span>
          <select
            value={limit}
            onChange={(event) => {
              setPage(1);
              setLimit(Number(event.target.value));
            }}
            aria-label="Suppliers per page"
            className="h-9 rounded-lg border border-[var(--admin-line)] bg-white px-2 font-semibold text-[var(--admin-ink)]"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {error ? (
        <AdminErrorState message={error} onRetry={() => void loadSuppliers()} />
      ) : isLoading && !data ? (
        <AdminLoadingState label="Loading suppliers" />
      ) : visibleSuppliers.length ? (
        <section className="overflow-x-auto rounded-2xl border border-[var(--admin-line)] bg-white">
          <div className="min-w-[820px]">
            <div className="grid grid-cols-[1.4fr_1.2fr_0.7fr_0.7fr_1fr] gap-4 bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--admin-muted)]">
              <span>Business</span><span>Contact</span><span>Verification</span><span>Status</span><span className="text-right">Actions</span>
            </div>
            {visibleSuppliers.map((supplier) => (
              <SupplierRow
                key={supplier._id}
                supplier={supplier}
                onView={() => setSelectedSupplier(supplier)}
                onChangeStatus={(nextStatus) =>
                  setPendingChange({ supplier, status: nextStatus })
                }
              />
            ))}
          </div>
        </section>
      ) : (
        <AdminEmptyState
          title="No suppliers found"
          description={data?.items.length ? "No suppliers on this page match the current filters." : "The API returned no suppliers for this page."}
        />
      )}

      {meta ? (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[var(--admin-line)] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--admin-muted)]">
            Showing {startItem}-{endItem} of {meta.totalItems} suppliers
          </p>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">Page {meta.currentPage} of {Math.max(meta.totalPages, 1)}</span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={meta.currentPage <= 1 || isLoading}
              aria-label="Previous supplier page"
              className="rounded-lg border border-[var(--admin-line)] p-2 hover:bg-slate-50 disabled:opacity-40"
            ><FiChevronLeft aria-hidden="true" /></button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(meta.totalPages, current + 1))}
              disabled={meta.currentPage >= meta.totalPages || isLoading}
              aria-label="Next supplier page"
              className="rounded-lg border border-[var(--admin-line)] p-2 hover:bg-slate-50 disabled:opacity-40"
            ><FiChevronRight aria-hidden="true" /></button>
          </div>
        </div>
      ) : null}

      {selectedSupplier ? (
        <SupplierDetails
          supplier={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
          onChangeStatus={(nextStatus) =>
            setPendingChange({ supplier: selectedSupplier, status: nextStatus })
          }
        />
      ) : null}

      {pendingChange ? (
        <AdminConfirmationDialog
          title={pendingChange.status === "ACTIVE" ? "Activate supplier?" : "Suspend supplier?"}
          description={
            pendingChange.status === "ACTIVE"
              ? `${supplierName(pendingChange.supplier)} will be allowed to use active supplier workflows.`
              : `${supplierName(pendingChange.supplier)} will lose access to active supplier workflows until reactivated.`
          }
          confirmLabel={pendingChange.status === "ACTIVE" ? "Activate" : "Suspend"}
          tone={pendingChange.status === "SUSPENDED" ? "danger" : "default"}
          isLoading={isUpdating}
          onCancel={() => setPendingChange(null)}
          onConfirm={() => void confirmStatusChange()}
        />
      ) : null}
    </>
  );
}

function SupplierRow({ supplier, onView, onChangeStatus }: { supplier: AdminSupplier; onView: () => void; onChangeStatus: (status: "ACTIVE" | "SUSPENDED") => void }) {
  const isActive = supplier.status === "ACTIVE";
  return (
    <div className="grid grid-cols-[1.4fr_1.2fr_0.7fr_0.7fr_1fr] items-center gap-4 border-t border-[var(--admin-line)] px-5 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--admin-navy)] text-sm font-bold text-white">
          {supplierName(supplier).charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{supplierName(supplier)}</p>
          <p className="mt-1 text-xs text-[var(--admin-muted)]">Joined {formatDate(supplier.createdAt)}</p>
        </div>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm">{supplier.email}</p>
        <p className="mt-1 truncate text-xs text-[var(--admin-muted)]">{supplier.phone || "No phone provided"}</p>
      </div>
      <span className={`text-xs font-semibold ${supplier.isEmailVerified ? "text-emerald-700" : "text-amber-700"}`}>
        {supplier.isEmailVerified ? "Verified" : "Unverified"}
      </span>
      <StatusLabel status={supplier.status} />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onView} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--admin-line)] px-3 py-2 text-xs font-bold hover:bg-slate-50">
          <FiEye aria-hidden="true" /> View
        </button>
        <button
          type="button"
          onClick={() => onChangeStatus(isActive ? "SUSPENDED" : "ACTIVE")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${isActive ? "bg-red-50 text-red-700 hover:bg-red-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}
        >
          {isActive ? <FiSlash aria-hidden="true" /> : <FiCheckCircle aria-hidden="true" />}
          {isActive ? "Suspend" : "Activate"}
        </button>
      </div>
    </div>
  );
}

function SupplierDetails({ supplier, onClose, onChangeStatus }: { supplier: AdminSupplier; onClose: () => void; onChangeStatus: (status: "ACTIVE" | "SUSPENDED") => void }) {
  const isActive = supplier.status === "ACTIVE";
  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <button type="button" aria-label="Close supplier details" className="absolute inset-0 bg-slate-950/55" onClick={onClose} />
      <aside role="dialog" aria-modal="true" aria-labelledby="supplier-details-title" className="absolute inset-y-0 right-0 w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 flex items-start justify-between border-b border-[var(--admin-line)] bg-white px-6 py-5">
          <div>
            <h2 id="supplier-details-title" className="font-display text-xl font-bold">{supplierName(supplier)}</h2>
            <div className="mt-2"><StatusLabel status={supplier.status} /></div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close supplier details" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><FiX aria-hidden="true" /></button>
        </div>
        <div className="space-y-7 p-6">
          <section>
            <h3 className="font-display text-base font-bold">Account information</h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Detail icon={FiUser} label="Contact name" value={[supplier.firstName, supplier.lastName].filter(Boolean).join(" ") || "Not provided"} />
              <Detail icon={FiMail} label="Email" value={supplier.email} />
              <Detail icon={FiPhone} label="Phone" value={supplier.phone || "Not provided"} />
              <Detail icon={FiShield} label="Email verification" value={supplier.isEmailVerified ? "Verified" : "Not verified"} />
              <Detail icon={FiHome} label="Supplier type" value={supplier.isHouseSupplier ? "House supplier" : "Marketplace supplier"} />
              <Detail icon={FiUser} label="Joined" value={formatDate(supplier.createdAt)} />
            </dl>
          </section>
          <section>
            <h3 className="font-display text-base font-bold">Business details</h3>
            <div className="mt-4 space-y-4">
              <Detail icon={FiMapPin} label="Address" value={supplier.physicalAddress || "Not provided"} />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--admin-muted)]">Company description</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{supplier.companyDescription || "No company description provided."}</p>
              </div>
            </div>
          </section>
          <div className="border-t border-[var(--admin-line)] pt-5">
            <button
              type="button"
              onClick={() => onChangeStatus(isActive ? "SUSPENDED" : "ACTIVE")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold ${isActive ? "bg-red-50 text-red-700 hover:bg-red-100" : "bg-[var(--admin-navy)] text-white hover:bg-[var(--admin-navy-soft)]"}`}
            >
              {isActive ? <FiSlash aria-hidden="true" /> : <FiCheckCircle aria-hidden="true" />}
              {isActive ? "Suspend supplier" : "Activate supplier"}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: typeof FiUser; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--admin-gold)]" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-xs font-semibold text-[var(--admin-muted)]">{label}</dt>
        <dd className="mt-1 break-words text-sm font-medium">{value}</dd>
      </div>
    </div>
  );
}

function StatusLabel({ status }: { status: AdminSupplierStatus }) {
  const styles = status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : status === "SUSPENDED" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${styles}`}>{status}</span>;
}

function supplierName(supplier: AdminSupplier) {
  return supplier.companyName || [supplier.firstName, supplier.lastName].filter(Boolean).join(" ") || supplier.email;
}

function formatDate(value?: string) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}
