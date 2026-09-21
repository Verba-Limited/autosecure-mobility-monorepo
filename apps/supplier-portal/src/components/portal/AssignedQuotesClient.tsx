"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  Car,
  CheckCircle2,
  Clock,
  FileSearch,
  Loader2,
  Package,
  RefreshCw,
  Send,
  Tag,
  Wrench,
} from "lucide-react";
import type { AssignedQuote, SupplierQuoteResponsePayload } from "@autosecure/api";
import { supplierPortalApi } from "@/lib/supplier-api";

function formatCurrency(amount?: number) {
  if (!amount || isNaN(amount)) return "—";
  return `₦${Number(amount).toLocaleString("en-NG")}`;
}

function formatDate(dateString?: string) {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function StatusBadge({ status }: { status?: string }) {
  const s = (status || "OPEN").toUpperCase();
  const styles: Record<string, string> = {
    ACCEPTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    DECLINED: "bg-red-50 text-red-700 border-red-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
    QUOTED: "bg-blue-50 text-blue-700 border-blue-200",
    OPEN: "bg-amber-50 text-amber-700 border-amber-200",
  };
  const labels: Record<string, string> = {
    ACCEPTED: "✓ Accepted",
    DECLINED: "✕ Declined",
    CANCELLED: "✕ Cancelled",
    QUOTED: "↗ Quoted",
    OPEN: "● Awaiting Quote",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${styles[s] ?? "bg-slate-50 text-slate-700 border-slate-200"}`}
    >
      {labels[s] ?? s}
    </span>
  );
}

type StatusFilter = "ALL" | "OPEN" | "QUOTED" | "ACCEPTED" | "DECLINED" | "CANCELLED";

export function AssignedQuotesClient() {
  const [quotes, setQuotes] = useState<AssignedQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("ALL");

  // Modal
  const [selectedQuote, setSelectedQuote] = useState<AssignedQuote | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [availability, setAvailability] = useState("IN_STOCK");
  const [leadTimeDays, setLeadTimeDays] = useState(2);
  const [partCondition, setPartCondition] = useState("NEW");
  const [message, setMessage] = useState("");
  const [validUntil, setValidUntil] = useState("");

  async function loadQuotes() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await supplierPortalApi.getAssignedQuotes();
      setQuotes(res?.items ?? []);
    } catch (err: any) {
      setError(err?.message || "Failed to load assigned quotes.");
      setQuotes([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadQuotes(); }, []);

  function handleOpenModal(quote: AssignedQuote) {
    setSelectedQuote(quote);
    setFormError(null);
    const r = quote.myResponses?.[0];
    setAmount(r?.price?.amount ? String(r.price.amount) : "");
    setAvailability(r?.availability || "IN_STOCK");
    setLeadTimeDays(r?.leadTimeDays || 2);
    setPartCondition(r?.partCondition || "NEW");
    setMessage(r?.message || "");
    setValidUntil(r?.validUntil ? r.validUntil.split("T")[0] : "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedQuote) return;
    const numeric = parseFloat(amount.replace(/[^0-9.]/g, ""));
    if (!numeric || numeric <= 0) {
      setFormError("Please enter a valid price.");
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      const payload: SupplierQuoteResponsePayload = {
        price: { amount: numeric, currency: "NGN" },
        availability,
        leadTimeDays: Number(leadTimeDays) || 1,
        partCondition,
        message: message.trim() || undefined,
        validUntil: validUntil || undefined,
      };
      await supplierPortalApi.respondToQuote(selectedQuote._id || selectedQuote.id || "", payload);
      setSelectedQuote(null);
      await loadQuotes();
    } catch (err: any) {
      setFormError(err?.message || "Failed to submit quotation.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const filtered = quotes.filter((q) =>
    activeFilter === "ALL" ? true : (q.status || "OPEN").toUpperCase() === activeFilter
  );

  const stats = {
    total: quotes.length,
    open: quotes.filter((q) => (q.status || "OPEN").toUpperCase() === "OPEN").length,
    quoted: quotes.filter((q) => (q.status || "").toUpperCase() === "QUOTED").length,
    accepted: quotes.filter((q) => q.status === "ACCEPTED").length,
  };

  const FILTERS: { key: StatusFilter; label: string }[] = [
    { key: "ALL", label: "All" },
    { key: "OPEN", label: "Awaiting" },
    { key: "QUOTED", label: "Quoted" },
    { key: "ACCEPTED", label: "Accepted" },
    { key: "DECLINED", label: "Declined" },
    { key: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-portal-ink">Assigned Quotes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Part & accessory requests from AutoSecure. Submit your best price to win the order.
          </p>
        </div>
        <button
          onClick={loadQuotes}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-portal-border bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-xs hover:bg-slate-50 transition-colors sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* ── Stats row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total", value: stats.total, color: "text-portal-ink" },
          { label: "Awaiting Price", value: stats.open, color: "text-amber-600" },
          { label: "Quotes Sent", value: stats.quoted, color: "text-blue-600" },
          { label: "Won (Accepted)", value: stats.accepted, color: "text-emerald-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-portal-border bg-white p-4 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className={`mt-1.5 text-3xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5 border-b border-portal-border pb-4">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
              activeFilter === key
                ? "bg-portal-ink text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-portal-ink"
            }`}
          >
            {label}
            {key !== "ALL" && (
              <span className={`ml-1.5 ${activeFilter === key ? "text-white/70" : "text-slate-400"}`}>
                ({quotes.filter((q) => (q.status || "OPEN").toUpperCase() === key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-portal-border bg-white">
          <Loader2 className="h-7 w-7 animate-spin text-portal-blue-600" />
          <p className="mt-3 text-sm font-semibold text-slate-500">Loading requests…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center">
          <AlertCircle className="h-7 w-7 text-red-500" />
          <p className="mt-2 text-sm font-bold text-red-800">{error}</p>
          <button
            onClick={loadQuotes}
            className="mt-4 rounded-lg bg-portal-ink px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-portal-border bg-white py-16 text-center">
          <FileSearch className="h-10 w-10 text-slate-300" />
          <h3 className="mt-4 text-base font-bold text-portal-ink">No requests found</h3>
          <p className="mt-1 max-w-xs text-sm text-slate-400">
            {activeFilter === "ALL"
              ? "AutoSecure hasn't assigned any quotation requests to you yet."
              : `No "${activeFilter.toLowerCase()}" requests.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((quote) => {
            const hasResponse = (quote.myResponses?.length ?? 0) > 0;
            const latest = hasResponse ? quote.myResponses[quote.myResponses.length - 1] : null;
            const canRespond = quote.status === "OPEN" || quote.status === "QUOTED";

            return (
              <div
                key={quote._id || quote.id || quote.reference}
                className="overflow-hidden rounded-xl border border-portal-border bg-white shadow-xs"
              >
                {/* Card top bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/70 px-5 py-3">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="font-mono text-xs font-bold text-slate-400 shrink-0">
                      {quote.reference}
                    </span>
                    <StatusBadge status={quote.status} />
                    <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-600 uppercase tracking-wide shrink-0">
                      {quote.productType || "PART"}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 shrink-0">
                    <Clock className="h-3 w-3" /> {formatDate(quote.createdAt)}
                  </span>
                </div>

                {/* Card body */}
                <div className="p-5">
                  <div className="grid gap-5 lg:grid-cols-3">
                    {/* ── Part info (2/3) ─────────────────────────────── */}
                    <div className="space-y-3 lg:col-span-2">
                      {/* Part name + qty + OEM */}
                      <div>
                        <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
                          <h3 className="text-base font-bold leading-tight text-portal-ink">
                            {quote.partName}
                          </h3>
                          {(quote.quantity ?? 1) > 1 && (
                            <span className="mt-0.5 shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                              Qty: {quote.quantity}
                            </span>
                          )}
                        </div>
                        {quote.oemNumber && (
                          <p className="mt-1 text-xs text-slate-500">
                            OEM / Part #:{" "}
                            <span className="font-mono font-semibold text-slate-700">
                              {quote.oemNumber}
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Vehicle target pill */}
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <Car className="h-3.5 w-3.5 text-portal-blue-600 shrink-0" />
                          <span className="font-semibold">
                            {[
                              quote.vehicle?.brandName || quote.vehicle?.brandSlug,
                              quote.vehicle?.modelName || quote.vehicle?.modelSlug,
                              quote.vehicle?.year ? `(${quote.vehicle.year})` : null,
                            ]
                              .filter(Boolean)
                              .join(" ") || "Any vehicle"}
                          </span>
                        </span>
                        {quote.vehicle?.vin && (
                          <span className="flex items-center gap-1">
                            <Wrench className="h-3 w-3 text-slate-400 shrink-0" />
                            VIN: <span className="font-mono">{quote.vehicle.vin}</span>
                          </span>
                        )}
                        {quote.vehicle?.engine && (
                          <span>Engine: {quote.vehicle.engine}</span>
                        )}
                      </div>

                      {/* Notes */}
                      {quote.notes && (
                        <p className="rounded-lg border border-slate-100 bg-slate-50/70 px-4 py-2.5 text-xs leading-relaxed text-slate-600 italic">
                          &ldquo;{quote.notes}&rdquo;
                        </p>
                      )}

                      {/* Photo attachments */}
                      {quote.images && quote.images.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                            Attachments
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {quote.images.map((img, idx) => (
                              <a
                                key={idx}
                                href={img}
                                target="_blank"
                                rel="noreferrer"
                                className="group relative h-14 w-14 overflow-hidden rounded-lg border border-slate-200"
                              >
                                <Image
                                  src={img}
                                  alt="Attachment"
                                  fill
                                  sizes="56px"
                                  className="object-cover transition-transform group-hover:scale-110"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ── Your quotation (1/3) ─────────────────────────── */}
                    <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Your Quotation
                      </p>

                      {latest ? (
                        <div className="flex-1 space-y-2 rounded-lg border border-blue-100 bg-blue-50/60 p-4">
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 shrink-0 text-portal-blue-600" />
                            <span className="text-2xl font-black leading-none text-portal-blue-600">
                              {formatCurrency(latest.price?.amount)}
                            </span>
                          </div>
                          <div className="space-y-1 text-xs font-medium text-slate-600">
                            <p>
                              <span className="text-slate-400">Avail:</span>{" "}
                              <span className="font-bold">
                                {(latest.availability || "—").replace(/_/g, " ")}
                              </span>
                            </p>
                            {latest.leadTimeDays != null && (
                              <p>
                                <span className="text-slate-400">Lead:</span>{" "}
                                <span className="font-bold">{latest.leadTimeDays} days</span>
                              </p>
                            )}
                            {latest.partCondition && (
                              <p>
                                <span className="text-slate-400">Condition:</span>{" "}
                                <span className="font-bold">
                                  {latest.partCondition}
                                </span>
                              </p>
                            )}
                          </div>
                          {latest.message && (
                            <p className="text-[11px] text-slate-500 italic leading-relaxed">
                              &ldquo;{latest.message}&rdquo;
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center rounded-lg border border-dashed border-slate-200 py-6">
                          <p className="text-center text-xs text-slate-400">
                            No quote submitted yet
                          </p>
                        </div>
                      )}

                      {canRespond ? (
                        <button
                          onClick={() => handleOpenModal(quote)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-portal-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-portal-blue-700"
                        >
                          <Send className="h-4 w-4" />
                          {hasResponse ? "Update Quote" : "Send Quotation"}
                        </button>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-500">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {quote.status === "ACCEPTED" ? "Quote Accepted" : `Closed — ${quote.status.toLowerCase()}`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Respond Modal ────────────────────────────────────────────────── */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200 sm:slide-in-from-bottom-0 sm:zoom-in-95">
            {/* Modal header */}
            <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <div className="min-w-0 pr-4">
                <h3 className="truncate font-bold text-portal-ink">
                  Quote: {selectedQuote.partName}
                </h3>
                <p className="mt-0.5 font-mono text-xs text-slate-400">
                  Ref: {selectedQuote.reference}
                </p>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              {formError && (
                <div className="rounded-lg bg-red-50 p-3 text-xs font-bold text-red-600">
                  {formError}
                </div>
              )}

              {/* Price */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Quotation Price (NGN ₦) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 45000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-portal-border px-3.5 py-2.5 text-sm font-semibold text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/20"
                />
              </div>

              {/* Availability + Lead Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Availability
                  </label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full rounded-lg border border-portal-border bg-white px-3 py-2.5 text-sm font-semibold text-portal-ink outline-none focus:border-portal-blue-600"
                  >
                    <option value="IN_STOCK">In Stock</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                    <option value="SPECIAL_ORDER">Special Order</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg border border-portal-border px-3.5 py-2.5 text-sm font-semibold text-portal-ink outline-none focus:border-portal-blue-600"
                  />
                </div>
              </div>

              {/* Condition + Valid Until */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Part Condition
                  </label>
                  <select
                    value={partCondition}
                    onChange={(e) => setPartCondition(e.target.value)}
                    className="w-full rounded-lg border border-portal-border bg-white px-3 py-2.5 text-sm font-semibold text-portal-ink outline-none focus:border-portal-blue-600"
                  >
                    <option value="NEW">Brand New / OEM</option>
                    <option value="AFTERMARKET">Aftermarket</option>
                    <option value="USED">Foreign Used</option>
                    <option value="REFURBISHED">Refurbished</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Valid Until (Optional)
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full rounded-lg border border-portal-border px-3.5 py-2.5 text-sm font-semibold text-portal-ink outline-none focus:border-portal-blue-600"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Remarks / Message
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Genuine OEM part, 12-month warranty included."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full resize-none rounded-lg border border-portal-border px-3.5 py-2.5 text-sm font-medium text-portal-ink outline-none focus:border-portal-blue-600"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedQuote(null)}
                  className="rounded-lg border border-portal-border px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-portal-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-portal-blue-700 disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Submitting…" : "Submit Quote"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
