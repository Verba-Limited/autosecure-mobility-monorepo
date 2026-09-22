"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiEdit3,
  FiExternalLink,
  FiLoader,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiUserCheck,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import type {
  AdminQuote,
  AdminQuoteResponse,
  AdminQuotesQuery,
  AdminSupplier,
  PaginationMeta,
} from "@autosecure/api";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminPageHeader,
} from "@/components/ui/AdminPrimitives";
import { adminApi, getAdminErrorMessage } from "@/lib/admin-api";
import { notifyError, notifySuccess } from "@/lib/admin-notifications";
import { useAdminAuthStore } from "@/stores/auth-store";

const emptyMeta: PaginationMeta = {
  totalItems: 0,
  itemCount: 0,
  itemsPerPage: 10,
  totalPages: 1,
  currentPage: 1,
};
const closedStatuses = new Set(["ACCEPTED", "DECLINED", "CANCELLED", "CLOSED"]);
type WorkspaceMode = "view" | "assign" | "respond" | "close";

export function QuotesRoute() {
  const accessToken = useAdminAuthStore((state) => state.accessToken);
  const [quotes, setQuotes] = useState<AdminQuote[]>([]);
  const [suppliers, setSuppliers] = useState<AdminSupplier[]>([]);
  const [meta, setMeta] = useState(emptyMeta);
  const [page, setPage] = useState(1);
  const [searchDraft, setSearchDraft] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [assignment, setAssignment] = useState("");
  const [productType, setProductType] = useState("");
  const [brandSlug, setBrandSlug] = useState("");
  const [selected, setSelected] = useState<AdminQuote | null>(null);
  const [mode, setMode] = useState<WorkspaceMode | null>(null);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState("");
  const [error, setError] = useState("");

  const filters = useMemo<AdminQuotesQuery>(
    () => ({
      page,
      limit: 10,
      q: query || undefined,
      status: status || undefined,
      assignedSupplier: assignment || undefined,
      productType: productType || undefined,
      brandSlug: brandSlug || undefined,
    }),
    [assignment, brandSlug, page, productType, query, status],
  );

  const loadQuotes = useCallback(
    async (showLoader = true) => {
      if (!accessToken) return;
      if (showLoader) setLoading(true);
      setError("");
      try {
        const response = await adminApi.getQuotes(accessToken, filters);
        setQuotes(response.data.items);
        setMeta(response.data.meta);
      } catch (requestError) {
        setError(getAdminErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    },
    [accessToken, filters],
  );

  const loadSuppliers = useCallback(async () => {
    if (!accessToken) return;
    try {
      const response = await adminApi.getSuppliers(accessToken, 1, 100);
      setSuppliers(response.data.items.filter((supplier) => supplier.status === "ACTIVE"));
    } catch (requestError) {
      notifyError(`Supplier choices could not be loaded: ${getAdminErrorMessage(requestError)}`);
    }
  }, [accessToken]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadQuotes(), 0);
    return () => window.clearTimeout(timer);
  }, [loadQuotes]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadSuppliers(), 0);
    return () => window.clearTimeout(timer);
  }, [loadSuppliers]);

  async function openQuote(quote: AdminQuote) {
    if (!accessToken) return;
    setOpeningId(quote._id);
    try {
      setSelected((await adminApi.getQuote(accessToken, quote._id)).data);
      setMode("view");
    } catch (requestError) {
      notifyError(getAdminErrorMessage(requestError));
    } finally {
      setOpeningId("");
    }
  }

  async function handleSaved(quote: AdminQuote, message: string) {
    setSelected(quote);
    setMode("view");
    notifySuccess(message);
    await loadQuotes(false);
  }

  function resetFilters() {
    setSearchDraft("");
    setQuery("");
    setStatus("");
    setAssignment("");
    setProductType("");
    setBrandSlug("");
    setPage(1);
  }

  return (
    <>
      <AdminPageHeader
        title="Quotes"
        description="Review customer quotation requests, route them to suppliers, and respond as AutoSecure."
      />

      <section className="mb-5 grid gap-3 rounded-2xl border border-[var(--admin-line)] bg-white p-4 md:grid-cols-2 xl:grid-cols-3">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setQuery(searchDraft.trim());
          }}
          className="flex min-w-0"
        >
          <input
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Reference, part or OEM number"
            aria-label="Search quotes"
            className="h-10 min-w-0 flex-1 rounded-l-lg border border-[var(--admin-line)] px-3 outline-none focus:border-slate-500"
          />
          <button type="submit" aria-label="Search" className="w-10 shrink-0 rounded-r-lg bg-[var(--admin-navy)] text-white">
            <FiSearch className="mx-auto" aria-hidden="true" />
          </button>
        </form>
        <FilterSelect label="status" value={status} onChange={(value) => { setStatus(value); setPage(1); }}>
          <option value="">Any status</option>
          <option value="OPEN">Open</option>
          <option value="QUOTED">Quoted</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="DECLINED">Declined</option>
          <option value="CANCELLED">Cancelled</option>
        </FilterSelect>
        <FilterSelect label="assignment" value={assignment} onChange={(value) => { setAssignment(value); setPage(1); }}>
          <option value="">Any assignment</option>
          <option value="none">Unassigned</option>
          {suppliers.map((supplier) => (
            <option key={supplier._id} value={supplier._id}>{supplierName(supplier)}</option>
          ))}
        </FilterSelect>
        <FilterSelect label="product type" value={productType} onChange={(value) => { setProductType(value); setPage(1); }}>
          <option value="">Any product type</option>
          <option value="PART">Part</option>
          <option value="TYRE">Tyre</option>
          <option value="BATTERY">Battery</option>
          <option value="ACCESSORY">Accessory</option>
        </FilterSelect>
        <input
          value={brandSlug}
          onChange={(event) => { setBrandSlug(event.target.value.trim().toLowerCase()); setPage(1); }}
          placeholder="Vehicle brand slug"
          aria-label="Vehicle brand slug"
          className="h-10 min-w-0 rounded-lg border border-[var(--admin-line)] px-3"
        />
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => void loadQuotes(false)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--admin-line)] px-3 text-sm font-bold">
            <FiRefreshCw aria-hidden="true" /> Refresh
          </button>
          <button type="button" onClick={resetFilters} className="h-10 rounded-lg border border-[var(--admin-line)] px-3 text-sm font-bold text-slate-600">
            Clear
          </button>
        </div>
      </section>

      {error ? (
        <AdminErrorState message={error} onRetry={() => void loadQuotes()} />
      ) : loading ? (
        <AdminLoadingState label="Loading quotation requests" />
      ) : quotes.length === 0 ? (
        <AdminEmptyState title="No quotation requests found" description="Try changing or clearing the queue filters." />
      ) : (
        <>
          <section className="overflow-x-auto rounded-2xl border border-[var(--admin-line)] bg-white">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[1fr_1.4fr_0.8fr_1fr_0.8fr_0.6fr] gap-4 border-b bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                <span>Reference</span><span>Request</span><span>Vehicle</span><span>Customer</span><span>Status</span><span />
              </div>
              {quotes.map((quote) => (
                <div key={quote._id} className="grid grid-cols-[1fr_1.4fr_0.8fr_1fr_0.8fr_0.6fr] items-center gap-4 border-b border-[var(--admin-line)] px-5 py-4 last:border-b-0">
                  <div>
                    <p className="font-bold">{quote.reference}</p>
                    <p className="mt-1 text-xs text-[var(--admin-muted)]">{formatDate(quote.createdAt)}</p>
                  </div>
                  <div>
                    <p className="font-semibold">{quote.partName}</p>
                    <p className="mt-1 text-xs text-[var(--admin-muted)]">{quote.productType} · Qty {quote.quantity}</p>
                  </div>
                  <span className="text-sm">{quote.vehicle.brandName || quote.vehicle.brandSlug || "Not set"}</span>
                  <span className="truncate text-sm">{quote.customer.email}</span>
                  <StatusText status={quote.status} />
                  <button
                    type="button"
                    onClick={() => void openQuote(quote)}
                    disabled={openingId === quote._id}
                    className="rounded-lg border border-[var(--admin-line)] px-3 py-2 text-xs font-bold disabled:opacity-50"
                  >
                    {openingId === quote._id ? <FiLoader className="mx-auto animate-spin" /> : "Manage"}
                  </button>
                </div>
              ))}
            </div>
          </section>
          <Pagination meta={meta} onPage={setPage} />
        </>
      )}

      {mode && selected ? (
        <QuoteWorkspace
          quote={selected}
          mode={mode}
          suppliers={suppliers}
          accessToken={accessToken}
          onMode={setMode}
          onClose={() => { setMode(null); setSelected(null); }}
          onSaved={handleSaved}
        />
      ) : null}
    </>
  );
}

function QuoteWorkspace({
  quote,
  mode,
  suppliers,
  accessToken,
  onMode,
  onClose,
  onSaved,
}: {
  quote: AdminQuote;
  mode: WorkspaceMode;
  suppliers: AdminSupplier[];
  accessToken: string | null;
  onMode: (mode: WorkspaceMode) => void;
  onClose: () => void;
  onSaved: (quote: AdminQuote, message: string) => Promise<void>;
}) {
  const isClosed = closedStatuses.has(quote.status);
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close quote details" className="absolute inset-0 bg-slate-950/55" onClick={onClose} />
      <aside role="dialog" aria-modal="true" aria-label={`Quote ${quote.reference}`} className="absolute inset-y-0 right-0 w-full max-w-3xl overflow-y-auto bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--admin-line)] bg-white px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">Quotation request</p>
            <h2 className="mt-1 text-xl font-bold">{quote.reference}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 hover:bg-slate-100"><FiX /></button>
        </header>
        {mode === "assign" ? (
          <AssignmentForm quote={quote} suppliers={suppliers} accessToken={accessToken} onCancel={() => onMode("view")} onSaved={onSaved} />
        ) : mode === "respond" ? (
          <ResponseForm quote={quote} accessToken={accessToken} onCancel={() => onMode("view")} onSaved={onSaved} />
        ) : mode === "close" ? (
          <CloseForm quote={quote} accessToken={accessToken} onCancel={() => onMode("view")} onSaved={onSaved} />
        ) : (
          <div className="space-y-7 p-6">
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={isClosed} onClick={() => onMode("assign")} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"><FiUserCheck /> Assign</button>
              <button type="button" disabled={isClosed} onClick={() => onMode("respond")} className="inline-flex items-center gap-2 rounded-lg bg-[var(--admin-navy)] px-3 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"><FiSend /> Respond</button>
              <button type="button" disabled={isClosed} onClick={() => onMode("close")} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-40"><FiXCircle /> Close request</button>
            </div>
            {isClosed ? <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">This request is closed. Assignment and response actions are unavailable.</p> : null}
            <section>
              <h3 className="mb-4 text-base font-bold">Request details</h3>
              <dl className="grid gap-4 sm:grid-cols-2">
                <Detail label="Status" value={quote.status} />
                <Detail label="Product type" value={quote.productType} />
                <Detail label="Part" value={quote.partName} />
                <Detail label="Quantity" value={String(quote.quantity)} />
                <Detail label="OEM number" value={quote.oemNumber} />
                <Detail label="Category" value={quote.partCategorySlug} />
                <Detail label="Customer" value={personName(quote.customer)} />
                <Detail label="Customer email" value={quote.customer.email} />
                <Detail label="Assigned supplier" value={quote.assignedSupplier ? supplierName(quote.assignedSupplier) : "Unassigned"} />
                <Detail label="Created" value={formatDate(quote.createdAt)} />
              </dl>
              {quote.notes ? <TextBlock label="Customer notes" value={quote.notes} /> : null}
              {quote.statusReason ? <TextBlock label="Closure reason" value={quote.statusReason} /> : null}
            </section>
            <section>
              <h3 className="mb-4 text-base font-bold">Compatible vehicle</h3>
              <dl className="grid gap-4 sm:grid-cols-2">
                <Detail label="Brand" value={quote.vehicle.brandName || quote.vehicle.brandSlug} />
                <Detail label="Model" value={quote.vehicle.modelName || quote.vehicle.modelSlug} />
                <Detail label="Trim" value={quote.vehicle.trimName} />
                <Detail label="Year" value={quote.vehicle.year ? String(quote.vehicle.year) : undefined} />
                <Detail label="VIN" value={quote.vehicle.vin} />
                <Detail label="Engine" value={quote.vehicle.engine} />
              </dl>
            </section>
            {quote.images.length ? (
              <section>
                <h3 className="mb-3 text-base font-bold">Request images</h3>
                <div className="flex flex-wrap gap-3">
                  {quote.images.map((url, index) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold">
                      Image {index + 1} <FiExternalLink />
                    </a>
                  ))}
                </div>
              </section>
            ) : null}
            <section>
              <h3 className="mb-4 text-base font-bold">Responses ({quote.responses.length})</h3>
              {quote.responses.length ? (
                <div className="space-y-3">
                  {quote.responses.map((response, index) => <ResponseCard key={response._id || response.id || index} response={response} />)}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed p-4 text-sm text-[var(--admin-muted)]">No responses have been sent.</p>
              )}
            </section>
          </div>
        )}
      </aside>
    </div>
  );
}

function AssignmentForm({ quote, suppliers, accessToken, onCancel, onSaved }: {
  quote: AdminQuote;
  suppliers: AdminSupplier[];
  accessToken: string | null;
  onCancel: () => void;
  onSaved: (quote: AdminQuote, message: string) => Promise<void>;
}) {
  const [supplierId, setSupplierId] = useState(quote.assignedSupplier?._id ?? "");
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!accessToken) return;
    setSaving(true);
    try {
      const response = await adminApi.assignQuote(accessToken, quote._id, { supplierId: supplierId || null });
      await onSaved(response.data, supplierId ? "Supplier assignment updated." : "Supplier assignment cleared.");
    } catch (requestError) {
      notifyError(getAdminErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-5 p-6">
      <div>
        <h3 className="text-lg font-bold">Supplier assignment</h3>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">Select an active supplier or clear the current assignment.</p>
      </div>
      <FieldLabel label="Supplier">
        <select value={supplierId} onChange={(event) => setSupplierId(event.target.value)} className="mt-2 h-11 w-full rounded-lg border px-3">
          <option value="">Unassigned</option>
          {suppliers.map((supplier) => <option key={supplier._id} value={supplier._id}>{supplierName(supplier)} · {supplier.email}</option>)}
        </select>
      </FieldLabel>
      <FormActions saving={saving} submitLabel="Save assignment" onCancel={onCancel} />
    </form>
  );
}

function ResponseForm({ quote, accessToken, onCancel, onSaved }: {
  quote: AdminQuote;
  accessToken: string | null;
  onCancel: () => void;
  onSaved: (quote: AdminQuote, message: string) => Promise<void>;
}) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [availability, setAvailability] = useState("IN_STOCK");
  const [leadTimeDays, setLeadTimeDays] = useState("");
  const [partCondition, setPartCondition] = useState("NEW");
  const [message, setMessage] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [validation, setValidation] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const numericAmount = Number(amount);
    const leadTime = leadTimeDays === "" ? undefined : Number(leadTimeDays);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setValidation("Enter a price greater than zero.");
      return;
    }
    if (!/^[A-Za-z]{3}$/.test(currency.trim())) {
      setValidation("Currency must use a three-letter code, such as NGN.");
      return;
    }
    if (leadTime !== undefined && (!Number.isInteger(leadTime) || leadTime < 0)) {
      setValidation("Lead time must be a whole number of zero or more days.");
      return;
    }
    if (validUntil && validUntil < new Date().toISOString().slice(0, 10)) {
      setValidation("The validity date cannot be in the past.");
      return;
    }
    if (!accessToken) return;
    setValidation("");
    setSaving(true);
    try {
      const response = await adminApi.respondToQuote(accessToken, quote._id, {
        price: { amount: numericAmount, currency: currency.trim().toUpperCase() },
        availability: availability || undefined,
        leadTimeDays: leadTime,
        partCondition: partCondition || undefined,
        message: message.trim() || undefined,
        validUntil: validUntil || undefined,
      });
      await onSaved(response.data, "Quotation response sent.");
    } catch (requestError) {
      notifyError(getAdminErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 p-6 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <h3 className="text-lg font-bold">Respond as AutoSecure</h3>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">The price and availability below will be visible to the customer.</p>
      </div>
      {validation ? <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2">{validation}</p> : null}
      <InputField label="Price" value={amount} onChange={setAmount} type="number" min="0.01" step="0.01" required />
      <InputField label="Currency" value={currency} onChange={setCurrency} maxLength={3} required />
      <FieldLabel label="Availability">
        <select value={availability} onChange={(event) => setAvailability(event.target.value)} className="mt-2 h-11 w-full rounded-lg border px-3">
          <option value="IN_STOCK">In stock</option>
          <option value="OUT_OF_STOCK">Out of stock</option>
          <option value="SPECIAL_ORDER">Special order</option>
        </select>
      </FieldLabel>
      <InputField label="Lead time (days)" value={leadTimeDays} onChange={setLeadTimeDays} type="number" min="0" step="1" />
      <FieldLabel label="Condition">
        <select value={partCondition} onChange={(event) => setPartCondition(event.target.value)} className="mt-2 h-11 w-full rounded-lg border px-3">
          <option value="NEW">New</option>
          <option value="USED">Used</option>
          <option value="REFURBISHED">Refurbished</option>
        </select>
      </FieldLabel>
      <InputField label="Valid until" value={validUntil} onChange={setValidUntil} type="date" min={new Date().toISOString().slice(0, 10)} />
      <label className="text-sm font-semibold sm:col-span-2">
        Customer message
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={4} className="mt-2 w-full rounded-lg border px-3 py-2" />
      </label>
      <FormActions saving={saving} submitLabel="Send response" onCancel={onCancel} />
    </form>
  );
}

function CloseForm({ quote, accessToken, onCancel, onSaved }: {
  quote: AdminQuote;
  accessToken: string | null;
  onCancel: () => void;
  onSaved: (quote: AdminQuote, message: string) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [validation, setValidation] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (reason.trim().length < 5) {
      setValidation("Enter a clear closure reason of at least five characters.");
      return;
    }
    if (!accessToken) return;
    setValidation("");
    setSaving(true);
    try {
      const response = await adminApi.closeQuote(accessToken, quote._id, { reason: reason.trim() });
      await onSaved(response.data, "Quotation request closed.");
    } catch (requestError) {
      notifyError(getAdminErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-5 p-6">
      <div>
        <h3 className="text-lg font-bold">Close quotation request</h3>
        <p className="mt-1 text-sm text-red-700">Closing this request is a lifecycle action. Confirm the reason before continuing.</p>
      </div>
      {validation ? <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{validation}</p> : null}
      <label className="text-sm font-semibold">
        Closure reason
        <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={5} required className="mt-2 w-full rounded-lg border px-3 py-2" />
      </label>
      <FormActions saving={saving} submitLabel="Close request" onCancel={onCancel} danger />
    </form>
  );
}

function ResponseCard({ response }: { response: AdminQuoteResponse }) {
  const responder = response.respondedBy || response.responderRole || (response.responder ? personName(response.responder) : "Unknown responder");
  return (
    <article className="rounded-xl border border-[var(--admin-line)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold">{formatMoney(response.price.amount, response.price.currency)}</p>
          <p className="mt-1 text-xs text-[var(--admin-muted)]">{responder} · {formatDate(response.at)}</p>
        </div>
        {response.accepted ? <span className="text-xs font-bold text-emerald-700">Accepted</span> : null}
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <Detail label="Availability" value={response.availability} />
        <Detail label="Lead time" value={response.leadTimeDays === undefined ? undefined : `${response.leadTimeDays} days`} />
        <Detail label="Condition" value={response.partCondition || undefined} />
      </dl>
      {response.message ? <p className="mt-4 text-sm leading-6 text-slate-600">{response.message}</p> : null}
      {response.validUntil ? <p className="mt-3 inline-flex items-center gap-2 text-xs text-[var(--admin-muted)]"><FiClock /> Valid until {formatDate(response.validUntil, false)}</p> : null}
    </article>
  );
}

function FilterSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <select aria-label={`Filter by ${label}`} value={value} onChange={(event) => onChange(event.target.value)} className="h-10 min-w-0 rounded-lg border border-[var(--admin-line)] bg-white px-3">{children}</select>;
}
function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="text-sm font-semibold">{label}{children}</label>;
}
function InputField({ label, value, onChange, type = "text", ...props }: { label: string; value: string; onChange: (value: string) => void; type?: "text" | "number" | "date"; min?: string; step?: string; maxLength?: number; required?: boolean }) {
  return <label className="text-sm font-semibold">{label}<input {...props} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-11 w-full rounded-lg border px-3" /></label>;
}
function FormActions({ saving, submitLabel, onCancel, danger = false }: { saving: boolean; submitLabel: string; onCancel: () => void; danger?: boolean }) {
  return <div className="flex justify-end gap-3 sm:col-span-2"><button type="button" onClick={onCancel} disabled={saving} className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600">Cancel</button><button type="submit" disabled={saving} className={`inline-flex min-w-32 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-60 ${danger ? "bg-red-600" : "bg-[var(--admin-navy)]"}`}>{saving ? <FiLoader className="animate-spin" /> : danger ? <FiXCircle /> : <FiEdit3 />}{submitLabel}</button></div>;
}
function Detail({ label, value }: { label: string; value?: string | null }) {
  return <div><dt className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">{label}</dt><dd className="mt-1 break-words text-sm font-semibold">{value || "Not set"}</dd></div>;
}
function TextBlock({ label, value }: { label: string; value: string }) {
  return <div className="mt-4 rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">{label}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{value}</p></div>;
}
function StatusText({ status }: { status: string }) {
  const color = status === "OPEN" ? "text-blue-700" : status === "QUOTED" ? "text-amber-700" : status === "ACCEPTED" ? "text-emerald-700" : "text-slate-600";
  return <span className={`text-sm font-bold ${color}`}>{status}</span>;
}
function Pagination({ meta, onPage }: { meta: PaginationMeta; onPage: (page: number) => void }) {
  return <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--admin-muted)]"><span>{meta.totalItems} request{meta.totalItems === 1 ? "" : "s"} · Page {meta.currentPage} of {Math.max(meta.totalPages, 1)}</span><div className="flex gap-2"><button type="button" disabled={meta.currentPage <= 1} onClick={() => onPage(meta.currentPage - 1)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 font-bold disabled:opacity-40"><FiChevronLeft /> Previous</button><button type="button" disabled={meta.currentPage >= meta.totalPages} onClick={() => onPage(meta.currentPage + 1)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 font-bold disabled:opacity-40">Next <FiChevronRight /></button></div></div>;
}
function supplierName(supplier: AdminSupplier) {
  return supplier.companyName || [supplier.firstName, supplier.lastName].filter(Boolean).join(" ") || supplier.email;
}
function personName(person: AdminQuote["customer"]) {
  return [person.firstName, person.lastName].filter(Boolean).join(" ") || person.email;
}
function formatDate(value?: string | null, includeTime = true) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return includeTime ? date.toLocaleString() : date.toLocaleDateString();
}
function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}
