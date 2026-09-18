"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Package,
  Send,
  Sparkles,
  XCircle,
} from "lucide-react";
import type { AssignedQuote, SupplierQuoteResponsePayload } from "@autosecure/api";
import { supplierPortalApi } from "@/lib/supplier-api";

function formatCurrency(amount?: number) {
  if (amount === undefined || amount === null) return "₦0";
  return `₦${amount.toLocaleString()}`;
}

function formatDate(dateString?: string) {
  if (!dateString) return "N/A";
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

type StatusFilter = "ALL" | "OPEN" | "QUOTED" | "ACCEPTED" | "DECLINED" | "CANCELLED";

export function AssignedQuotesClient() {
  const [quotes, setQuotes] = useState<AssignedQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("ALL");

  // Modal State for Responding
  const [selectedQuote, setSelectedQuote] = useState<AssignedQuote | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [availability, setAvailability] = useState<string>("IN_STOCK");
  const [leadTimeDays, setLeadTimeDays] = useState<number>(2);
  const [partCondition, setPartCondition] = useState<string>("NEW");
  const [message, setMessage] = useState<string>("");
  const [validUntil, setValidUntil] = useState<string>("");

  async function loadQuotes() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await supplierPortalApi.getAssignedQuotes();
      const items = res?.items ?? [];
      setQuotes(items);
    } catch (err: any) {
      setError(err?.message || "Failed to load assigned quotes.");
      setQuotes([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadQuotes();
  }, []);

  function handleOpenRespondModal(quote: AssignedQuote) {
    setSelectedQuote(quote);
    setFormError(null);
    const existingResponse = quote.myResponses?.[0];
    if (existingResponse) {
      setAmount(existingResponse.price?.amount ? String(existingResponse.price.amount) : "");
      setAvailability(existingResponse.availability || "IN_STOCK");
      setLeadTimeDays(existingResponse.leadTimeDays || 2);
      setPartCondition(existingResponse.partCondition || "NEW");
      setMessage(existingResponse.message || "");
      setValidUntil(existingResponse.validUntil ? existingResponse.validUntil.split("T")[0] : "");
    } else {
      setAmount("");
      setAvailability("IN_STOCK");
      setLeadTimeDays(2);
      setPartCondition("NEW");
      setMessage("");
      setValidUntil("");
    }
  }

  async function handleSubmitQuote(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedQuote) return;
    const numericAmount = parseFloat(amount.replace(/[^0-9.]/g, ""));
    if (!numericAmount || numericAmount <= 0) {
      setFormError("Please enter a valid quotation price.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload: SupplierQuoteResponsePayload = {
        price: {
          amount: numericAmount,
          currency: "NGN",
        },
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
      setFormError(err?.message || "Failed to submit quotation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredQuotes = quotes.filter((q) => {
    if (activeFilter === "ALL") return true;
    return (q.status || "OPEN").toUpperCase() === activeFilter;
  });

  const stats = {
    total: quotes.length,
    open: quotes.filter((q) => (q.status || "OPEN").toUpperCase() === "OPEN").length,
    quoted: quotes.filter((q) => (q.status || "OPEN").toUpperCase() === "QUOTED").length,
    accepted: quotes.filter((q) => q.status === "ACCEPTED").length,
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-portal-ink">
          Assigned Quotes
        </h1>
        <p className="mt-1.5 text-sm font-medium text-slate-500">
          Review vehicle parts and accessories requests assigned to you by AutoSecure and submit your price quotations.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-portal-border bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Requests</p>
          <p className="mt-2 text-2xl font-black text-portal-ink">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-portal-border bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-500">Awaiting Price</p>
          <p className="mt-2 text-2xl font-black text-amber-600">{stats.open}</p>
        </div>
        <div className="rounded-xl border border-portal-border bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-500">Quotes Sent</p>
          <p className="mt-2 text-2xl font-black text-portal-blue-600">{stats.quoted}</p>
        </div>
        <div className="rounded-xl border border-portal-border bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">Accepted</p>
          <p className="mt-2 text-2xl font-black text-emerald-600">{stats.accepted}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-portal-border pb-4 text-sm font-semibold">
        {(["ALL", "OPEN", "QUOTED", "ACCEPTED", "DECLINED", "CANCELLED"] as StatusFilter[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`rounded-lg px-3.5 py-1.5 transition-colors ${
              activeFilter === tab
                ? "bg-portal-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab === "ALL" ? "All Requests" : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Content State */}
      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-portal-border bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-portal-blue-600" />
          <p className="mt-3 text-sm font-semibold text-slate-500">Loading assigned quotation requests...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="mt-2 font-bold text-red-800">{error}</p>
          <button
            onClick={loadQuotes}
            className="mt-4 rounded-lg bg-portal-ink px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            Try Again
          </button>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-portal-border bg-white py-16 text-center">
          <Package className="h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-base font-bold text-portal-ink">No quotations found</h3>
          <p className="mt-1 text-sm text-slate-400">
            {activeFilter === "ALL"
              ? "You do not have any assigned quotation requests from AutoSecure at the moment."
              : `No requests with status "${activeFilter}" were found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuotes.map((quote) => {
            const hasResponded = quote.myResponses && quote.myResponses.length > 0;
            const myLatest = hasResponded ? quote.myResponses[quote.myResponses.length - 1] : null;

            return (
              <article
                key={quote._id || quote.id || quote.reference}
                className="overflow-hidden rounded-xl border border-portal-border bg-white shadow-xs transition-shadow hover:shadow-md"
              >
                <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-3.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      {quote.reference}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        quote.status === "ACCEPTED"
                          ? "bg-emerald-100 text-emerald-800"
                          : quote.status === "DECLINED"
                          ? "bg-red-100 text-red-700"
                          : quote.status === "QUOTED"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {quote.status}
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Clock className="h-3.5 w-3.5" /> Requested {formatDate(quote.createdAt)}
                  </span>
                </div>

                <div className="p-6">
                  <div className="grid gap-6 md:grid-cols-12">
                    {/* Left details */}
                    <div className="md:col-span-8 space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-portal-ink">
                          {quote.partName} {quote.quantity > 1 ? `(Qty: ${quote.quantity})` : ""}
                        </h3>
                        {quote.oemNumber && (
                          <p className="mt-0.5 text-xs font-medium text-slate-500">
                            OEM / Part #: <span className="font-mono font-bold text-slate-700">{quote.oemNumber}</span>
                          </p>
                        )}
                      </div>

                      {/* Vehicle target */}
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs font-medium text-slate-700 flex flex-wrap items-center gap-x-6 gap-y-2">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-portal-blue-600" />
                          <span>
                            <strong>Vehicle:</strong> {quote.vehicle?.brandName || quote.vehicle?.brandSlug || "Any"}{" "}
                            {quote.vehicle?.modelName || quote.vehicle?.modelSlug || ""}{" "}
                            {quote.vehicle?.year ? `(${quote.vehicle.year})` : ""}
                          </span>
                        </div>
                        {quote.vehicle?.vin && (
                          <span>
                            <strong>VIN:</strong> <span className="font-mono">{quote.vehicle.vin}</span>
                          </span>
                        )}
                        {quote.vehicle?.engine && (
                          <span>
                            <strong>Engine:</strong> {quote.vehicle.engine}
                          </span>
                        )}
                      </div>

                      {/* Customer Note */}
                      {quote.notes && (
                        <p className="text-sm italic text-slate-600">
                          &ldquo;{quote.notes}&rdquo;
                        </p>
                      )}

                      {/* Photo attachments */}
                      {quote.images && quote.images.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Customer Attachments</p>
                          <div className="flex flex-wrap gap-2">
                            {quote.images.map((img, idx) => (
                              <a
                                key={idx}
                                href={img}
                                target="_blank"
                                rel="noreferrer"
                                className="group relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200"
                              >
                                <Image
                                  src={img}
                                  alt="Part sample"
                                  fill
                                  sizes="64px"
                                  className="object-cover transition-transform group-hover:scale-110"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right side: response status & action */}
                    <div className="md:col-span-4 flex flex-col justify-between border-t border-slate-100 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Quotation</p>
                        {myLatest ? (
                          <div className="rounded-lg bg-portal-blue-600/5 p-3.5 border border-portal-blue-600/20">
                            <p className="text-xl font-black text-portal-blue-600">
                              {formatCurrency(myLatest.price?.amount)}
                            </p>
                            <p className="mt-1 text-xs text-slate-600 font-medium">
                              Availability: <span className="font-bold">{myLatest.availability}</span>
                            </p>
                            {myLatest.leadTimeDays && (
                              <p className="text-xs text-slate-600 font-medium">
                                Lead Time: <span className="font-bold">{myLatest.leadTimeDays} days</span>
                              </p>
                            )}
                            {myLatest.message && (
                              <p className="mt-2 text-xs text-slate-500 italic">
                                &ldquo;{myLatest.message}&rdquo;
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm font-medium text-slate-400">
                            You have not submitted a quote for this request yet.
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100">
                        {quote.status === "OPEN" || quote.status === "QUOTED" ? (
                          <button
                            onClick={() => handleOpenRespondModal(quote)}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-portal-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-portal-blue-700"
                          >
                            <Send className="h-4 w-4" />
                            {hasResponded ? "Update Quote" : "Send Quotation"}
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-slate-400">
                            Request is {quote.status.toLowerCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Respond Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="border-b border-portal-border bg-slate-50 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-portal-ink">
                  Quote for: {selectedQuote.partName}
                </h3>
                <p className="text-xs text-slate-500 font-mono">Ref: {selectedQuote.reference}</p>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitQuote} className="p-6 space-y-4">
              {formError && (
                <div className="rounded-lg bg-red-50 p-3 text-xs font-bold text-red-600">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Quotation Price (NGN ₦) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 45000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-portal-border px-3.5 py-2 text-sm font-semibold text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-1 focus:ring-portal-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Availability
                  </label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-portal-border bg-white px-3 py-2 text-sm font-semibold text-portal-ink outline-none focus:border-portal-blue-600"
                  >
                    <option value="IN_STOCK">In Stock</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                    <option value="SPECIAL_ORDER">Special Order</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(parseInt(e.target.value) || 0)}
                    className="mt-1.5 w-full rounded-lg border border-portal-border px-3.5 py-2 text-sm font-semibold text-portal-ink outline-none focus:border-portal-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Condition
                  </label>
                  <select
                    value={partCondition}
                    onChange={(e) => setPartCondition(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-portal-border bg-white px-3 py-2 text-sm font-semibold text-portal-ink outline-none focus:border-portal-blue-600"
                  >
                    <option value="NEW">Brand New / OEM</option>
                    <option value="AFTERMARKET">Aftermarket</option>
                    <option value="USED">Foreign Used</option>
                    <option value="REFURBISHED">Refurbished</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Valid Until (Optional)
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-portal-border px-3.5 py-2 text-sm font-semibold text-portal-ink outline-none focus:border-portal-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Message / Remarks to AutoSecure
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Genuine OEM part with 12 months manufacturer warranty."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-portal-border px-3.5 py-2 text-sm font-medium text-portal-ink outline-none focus:border-portal-blue-600"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedQuote(null)}
                  className="rounded-lg border border-portal-border px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-portal-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-portal-blue-700 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Submit Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
