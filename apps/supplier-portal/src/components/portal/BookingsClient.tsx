"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  User,
  X,
  XCircle,
} from "lucide-react";
import { supplierPortalApi } from "@/lib/supplier-api";

type BookingStatus = "ALL" | "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface BookingItem {
  _id: string;
  reference?: string;
  customer?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string | null;
  };
  listing?: {
    _id?: string;
    type?: string;
    title?: string;
    brand?: string;
    model?: string;
    year?: number;
    condition?: string;
    images?: string[];
    pricing?: {
      retail?: number;
      promotional?: number;
      currency?: string;
    };
  };
  scheduledDate?: string;
  scheduledTime?: string;
  note?: string;
  status: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "Not scheduled";
  try {
    return new Date(dateStr).toLocaleDateString("en-NG", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function BookingsClient() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<BookingStatus>("ALL");

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [rejectModalBooking, setRejectModalBooking] = useState<BookingItem | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [declineError, setDeclineError] = useState<string | null>(null);

  async function loadBookings() {
    setIsLoading(true);
    setError(null);
    try {
      const payload: any = await supplierPortalApi.getBookings();
      const items = payload?.data?.items ?? payload?.items ?? (Array.isArray(payload) ? payload : []);
      setBookings(items);
    } catch (err: any) {
      setError(err?.message || "Failed to load bookings.");
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function handleConfirm(id: string) {
    setActionLoadingId(id);
    try {
      await supplierPortalApi.confirmBooking(id);
      await loadBookings();
    } catch (err: any) {
      alert(err?.message || "Failed to confirm booking.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDeclineSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rejectModalBooking) return;
    if (!declineReason.trim()) {
      setDeclineError("Please provide a reason for declining.");
      return;
    }

    setActionLoadingId(rejectModalBooking._id);
    setDeclineError(null);

    try {
      await supplierPortalApi.rejectBooking(rejectModalBooking._id, declineReason.trim());
      setRejectModalBooking(null);
      setDeclineReason("");
      await loadBookings();
    } catch (err: any) {
      setDeclineError(err?.message || "Failed to decline booking.");
    } finally {
      setActionLoadingId(null);
    }
  }

  const filteredBookings = bookings.filter((b) => {
    if (activeFilter === "ALL") return true;
    return (b.status || "PENDING").toUpperCase() === activeFilter;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => (b.status || "PENDING").toUpperCase() === "PENDING").length,
    confirmed: bookings.filter((b) => b.status === "CONFIRMED").length,
    cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-portal-ink">
          Bookings & Inspections
        </h1>
        <p className="mt-1.5 text-sm font-medium text-slate-500">
          Manage customer appointments, test-drives, and inspection requests for your vehicles.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-portal-border bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Bookings</p>
          <p className="mt-2 text-2xl font-black text-portal-ink">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-portal-border bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-500">Action Required</p>
          <p className="mt-2 text-2xl font-black text-amber-600">{stats.pending}</p>
        </div>
        <div className="rounded-xl border border-portal-border bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">Confirmed</p>
          <p className="mt-2 text-2xl font-black text-emerald-600">{stats.confirmed}</p>
        </div>
        <div className="rounded-xl border border-portal-border bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Cancelled</p>
          <p className="mt-2 text-2xl font-black text-slate-500">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-portal-border pb-4 text-sm font-semibold">
        {(["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as BookingStatus[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`rounded-lg px-3.5 py-1.5 transition-colors ${
              activeFilter === tab
                ? "bg-portal-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab === "ALL" ? "All Bookings" : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-portal-border bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-portal-blue-600" />
          <p className="mt-3 text-sm font-semibold text-slate-500">Loading your scheduled bookings...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="mt-2 font-bold text-red-800">{error}</p>
          <button
            onClick={loadBookings}
            className="mt-4 rounded-lg bg-portal-ink px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            Try Again
          </button>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-portal-border bg-white py-16 text-center">
          <Calendar className="h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-base font-bold text-portal-ink">No bookings found</h3>
          <p className="mt-1 text-sm text-slate-400">
            {activeFilter === "ALL"
              ? "You do not have any vehicle bookings or inspection appointments at this time."
              : `No appointments with status "${activeFilter}" were found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const customerName = `${booking.customer?.firstName || "Customer"} ${booking.customer?.lastName || ""}`.trim();
            const vehicleTitle = booking.listing?.title || `${booking.listing?.brand || ""} ${booking.listing?.model || ""}`.trim() || "Vehicle";
            const isPending = (booking.status || "PENDING").toUpperCase() === "PENDING";
            const isConfirmed = booking.status === "CONFIRMED";

            return (
              <article
                key={booking._id || booking.reference}
                className="overflow-hidden rounded-xl border border-portal-border bg-white shadow-xs transition-shadow hover:shadow-md"
              >
                {/* Header bar */}
                <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-3.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      {booking.reference || `BK-${booking._id.slice(-6)}`}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        isConfirmed
                          ? "bg-emerald-100 text-emerald-800"
                          : booking.status === "CANCELLED"
                          ? "bg-red-100 text-red-700"
                          : isPending
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Calendar className="h-4 w-4 text-portal-blue-600" />
                      {formatDate(booking.scheduledDate)}
                    </span>
                    {booking.scheduledTime && (
                      <span className="flex items-center gap-1 font-bold text-slate-700">
                        <Clock className="h-3.5 w-3.5 text-portal-blue-600" />
                        {booking.scheduledTime}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid gap-6 md:grid-cols-12">
                    {/* Left: Vehicle and Customer Details */}
                    <div className="md:col-span-8 space-y-4">
                      {/* Vehicle summary */}
                      <div className="flex items-start gap-4">
                        {booking.listing?.images?.[0] ? (
                          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-slate-200">
                            <Image
                              src={booking.listing.images[0]}
                              alt={vehicleTitle}
                              fill
                              sizes="96px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                            <Calendar className="h-6 w-6" />
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Inquired Vehicle</p>
                          <h3 className="text-base font-bold text-portal-ink">{vehicleTitle}</h3>
                          {booking.listing?.pricing?.retail && (
                            <p className="text-xs font-extrabold text-portal-blue-600">
                              ₦{booking.listing.pricing.retail.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Customer contact pill */}
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs font-medium text-slate-700 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-portal-blue-600/10 font-black text-portal-blue-600">
                            {customerName.charAt(0) || "C"}
                          </div>
                          <div>
                            <p className="font-bold text-portal-ink">{customerName}</p>
                            <p className="text-[11px] text-slate-400">Prospective Buyer</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {booking.customer?.phone && (
                            <a
                              href={`tel:${booking.customer.phone}`}
                              className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1.5 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
                            >
                              <Phone className="h-3.5 w-3.5 text-emerald-600" />
                              {booking.customer.phone}
                            </a>
                          )}
                          {booking.customer?.email && (
                            <a
                              href={`mailto:${booking.customer.email}`}
                              className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1.5 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
                            >
                              <Mail className="h-3.5 w-3.5 text-blue-600" />
                              Email
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Customer Note */}
                      {booking.note && (
                        <div className="rounded-lg bg-amber-50/70 border border-amber-200/60 p-3 text-xs text-amber-900">
                          <strong>Customer Note:</strong> &ldquo;{booking.note}&rdquo;
                        </div>
                      )}

                      {/* Decline Reason if Cancelled */}
                      {booking.rejectionReason && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800">
                          <strong>Decline Reason:</strong> {booking.rejectionReason}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="md:col-span-4 flex flex-col justify-between border-t border-slate-100 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Appointment Status</p>
                        {isConfirmed ? (
                          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                            <span>Confirmed for {booking.scheduledTime || "the day"}</span>
                          </div>
                        ) : isPending ? (
                          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs font-semibold text-amber-800">
                            Please confirm if this slot is available at your dealership.
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500">
                            This appointment is closed ({booking.status.toLowerCase()}).
                          </p>
                        )}
                      </div>

                      {isPending && (
                        <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-slate-100">
                          <button
                            onClick={() => handleConfirm(booking._id)}
                            disabled={actionLoadingId === booking._id}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {actionLoadingId === booking._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                            Confirm Appointment
                          </button>
                          <button
                            onClick={() => {
                              setRejectModalBooking(booking);
                              setDeclineReason("");
                              setDeclineError(null);
                            }}
                            disabled={actionLoadingId === booking._id}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                          >
                            <X className="h-4 w-4 text-red-500" />
                            Decline / Unavailable
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Decline Reason Modal */}
      {rejectModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="border-b border-portal-border bg-slate-50 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-portal-ink">Decline Booking</h3>
              <button
                onClick={() => setRejectModalBooking(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeclineSubmit} className="p-6 space-y-4">
              {declineError && (
                <div className="rounded-lg bg-red-50 p-3 text-xs font-bold text-red-600">
                  {declineError}
                </div>
              )}

              <p className="text-xs text-slate-600">
                Please provide a brief reason why this slot is unavailable so AutoSecure can help the customer reschedule.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. That slot is unavailable, please select another time or weekend."
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-portal-border px-3.5 py-2 text-sm font-medium text-portal-ink outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectModalBooking(null)}
                  className="rounded-lg border border-portal-border px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === rejectModalBooking._id}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoadingId === rejectModalBooking._id && <Loader2 className="h-4 w-4 animate-spin" />}
                  Decline Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
