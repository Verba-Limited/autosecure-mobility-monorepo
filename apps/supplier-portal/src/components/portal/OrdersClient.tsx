"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Car,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Truck,
} from "lucide-react";
import { supplierPortalApi } from "@/lib/supplier-api";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderTimelineStep = {
  key: string;
  label: string;
  description?: string;
  order: number;
  state: "completed" | "current" | "upcoming";
  at?: string | null;
};

type OrderHistoryItem = {
  stageKey: string;
  stageLabel: string;
  note?: string;
  at: string;
};

type CustomerOrder = {
  _id: string;
  id?: string;
  reference: string;
  vehicle?: {
    _id?: string;
    title?: string;
    brand?: string;
    model?: string;
    year?: number;
    colour?: string;
    vin?: string;
    image?: string;
  };
  customer?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  agreedPrice?: { amount?: number; currency?: string };
  status: string;
  currentStage?: { key: string; label: string };
  estimatedDeliveryDate?: string | null;
  deliveryAddress?: string | null;
  history?: OrderHistoryItem[];
  timeline?: OrderTimelineStep[];
  createdAt: string;
  updatedAt: string;
};

type OrderFilter = "ALL" | "ACTIVE" | "COMPLETED" | "CANCELLED";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNaira(amount?: number) {
  if (!amount) return "—";
  return `₦${Number(amount).toLocaleString("en-NG")}`;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toUpperCase();
  const map: Record<string, { cls: string; label: string }> = {
    ACTIVE: { cls: "bg-blue-50 text-blue-700 border-blue-200", label: "● Active" },
    COMPLETED: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "✓ Completed" },
    CANCELLED: { cls: "bg-red-50 text-red-700 border-red-200", label: "✕ Cancelled" },
  };
  const { cls, label } = map[s] ?? { cls: "bg-slate-100 text-slate-700 border-slate-200", label: s };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${cls}`}>
      {label}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OrdersClient() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState<string | null>(null);
  const [detailCache, setDetailCache] = useState<Record<string, CustomerOrder>>({});

  async function loadOrders() {
    setIsLoading(true);
    setError(null);
    try {
      const res: any = await supplierPortalApi.getOrders();
      const items: CustomerOrder[] =
        res?.data?.items ?? res?.items ?? (Array.isArray(res) ? res : []);
      setOrders(items);
    } catch (err: any) {
      setError(err?.message || "Failed to load orders.");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadOrders(); }, []);

  async function handleToggleExpand(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!detailCache[id]) {
      setDetailLoading(id);
      try {
        const detail: any = await supplierPortalApi.getOrder(id);
        const order: CustomerOrder = detail?.data ?? detail;
        if (order) {
          setDetailCache((prev) => ({ ...prev, [id]: order }));
        }
      } catch {
        // silent — fall back to list data
      } finally {
        setDetailLoading(null);
      }
    }
  }

  const FILTERS: { key: OrderFilter; label: string }[] = [
    { key: "ALL", label: "All Orders" },
    { key: "ACTIVE", label: "Active" },
    { key: "COMPLETED", label: "Completed" },
    { key: "CANCELLED", label: "Cancelled" },
  ];

  const filtered = orders.filter((o) =>
    activeFilter === "ALL" ? true : (o.status || "").toUpperCase() === activeFilter
  );

  const stats = {
    total: orders.length,
    active: orders.filter((o) => (o.status || "").toUpperCase() === "ACTIVE").length,
    completed: orders.filter((o) => o.status === "COMPLETED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-portal-ink">Order Tracking</h1>
          <p className="mt-1 text-sm text-slate-500">
            Customer vehicle orders linked to your listings — track each stage from order to delivery.
          </p>
        </div>
        <button
          onClick={loadOrders}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-portal-border bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-xs hover:bg-slate-50 transition-colors sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Orders", value: stats.total, color: "text-portal-ink" },
          { label: "In Progress", value: stats.active, color: "text-blue-600" },
          { label: "Completed", value: stats.completed, color: "text-emerald-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-portal-border bg-white p-4 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className={`mt-1.5 text-3xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
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
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-portal-border bg-white">
          <Loader2 className="h-7 w-7 animate-spin text-portal-blue-600" />
          <p className="mt-3 text-sm font-semibold text-slate-500">Loading orders…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center">
          <AlertCircle className="h-7 w-7 text-red-500" />
          <p className="mt-2 text-sm font-bold text-red-800">{error}</p>
          <button
            onClick={loadOrders}
            className="mt-4 rounded-lg bg-portal-ink px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-portal-border bg-white py-16 text-center">
          <Package className="h-10 w-10 text-slate-300" />
          <h3 className="mt-4 text-base font-bold text-portal-ink">No orders yet</h3>
          <p className="mt-1 max-w-xs text-sm text-slate-400">
            {activeFilter === "ALL"
              ? "When a customer places an order on one of your vehicles, it will appear here."
              : `No "${activeFilter.toLowerCase()}" orders found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const id = order._id || order.id || "";
            const isExpanded = expandedId === id;
            const isLoadingThis = detailLoading === id;
            const detail = detailCache[id] ?? order;
            const vehicleLabel =
              order.vehicle?.title ||
              [order.vehicle?.brand, order.vehicle?.model, order.vehicle?.year]
                .filter(Boolean)
                .join(" ") ||
              "Vehicle";
            const customerName = [
              order.customer?.firstName,
              order.customer?.lastName,
            ]
              .filter(Boolean)
              .join(" ") || "Customer";

            return (
              <div
                key={id}
                className="overflow-hidden rounded-xl border border-portal-border bg-white shadow-xs"
              >
                {/* Card header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/70 px-5 py-3">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="font-mono text-xs font-bold text-slate-400 shrink-0">
                      {order.reference}
                    </span>
                    <StatusBadge status={order.status} />
                    {order.currentStage?.label && (
                      <span className="text-[11px] font-semibold text-slate-500">
                        Stage: {order.currentStage.label}
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 shrink-0">
                    <Clock className="h-3 w-3" /> {formatDate(order.createdAt)}
                  </span>
                </div>

                {/* Card body */}
                <div className="p-5">
                  <div className="grid gap-5 sm:grid-cols-3">
                    {/* Vehicle */}
                    <div className="space-y-1 sm:col-span-2">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Vehicle</p>
                      <p className="flex items-center gap-2 font-bold text-portal-ink">
                        <Car className="h-4 w-4 shrink-0 text-portal-blue-600" />
                        {vehicleLabel}
                      </p>
                      {order.vehicle?.vin && (
                        <p className="pl-6 text-xs text-slate-500">
                          VIN: <span className="font-mono font-semibold text-slate-700">{order.vehicle.vin}</span>
                        </p>
                      )}
                      {order.vehicle?.colour && (
                        <p className="pl-6 text-xs text-slate-500">Colour: {order.vehicle.colour}</p>
                      )}
                      {order.customer && (
                        <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-portal-blue-600/10 text-[10px] font-black text-portal-blue-600">
                            {customerName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-portal-ink">{customerName}</p>
                            {order.customer.email && (
                              <p className="text-[11px] text-slate-400">{order.customer.email}</p>
                            )}
                          </div>
                        </div>
                      )}
                      {order.deliveryAddress && (
                        <p className="flex items-center gap-1 pl-1 text-xs text-slate-500">
                          <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                          {order.deliveryAddress}
                        </p>
                      )}
                    </div>

                    {/* Agreed price + delivery */}
                    <div className="flex flex-col gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          Agreed Price
                        </p>
                        <p className="mt-1 text-2xl font-black text-portal-ink">
                          {formatNaira(order.agreedPrice?.amount)}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {order.agreedPrice?.currency || "NGN"}
                        </p>
                      </div>
                      {order.estimatedDeliveryDate && (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs">
                          <p className="font-bold text-slate-500">Est. Delivery</p>
                          <p className="font-black text-portal-ink">
                            {formatDate(order.estimatedDeliveryDate)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expand timeline button */}
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <button
                      onClick={() => handleToggleExpand(id)}
                      className="flex w-full items-center justify-between text-xs font-bold text-slate-500 hover:text-portal-ink"
                    >
                      <span className="flex items-center gap-1.5">
                        <Truck className="h-3.5 w-3.5 text-portal-blue-600" />
                        {isExpanded ? "Hide Tracking Timeline" : "View Tracking Timeline"}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    {/* Expanded timeline */}
                    {isExpanded && (
                      <div className="mt-4 space-y-4 animate-in fade-in duration-200">
                        {isLoadingThis ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-5 w-5 animate-spin text-portal-blue-600" />
                          </div>
                        ) : (
                          <>
                            {/* Stage progress */}
                            {detail.timeline && detail.timeline.length > 0 && (
                              <div>
                                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                  Stage Progress
                                </p>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                                  {detail.timeline.map((step) => {
                                    const done = step.state === "completed";
                                    const curr = step.state === "current";
                                    return (
                                      <div
                                        key={step.key}
                                        className={`rounded-lg border p-3 text-xs ${
                                          curr
                                            ? "border-portal-blue-600/30 bg-portal-blue-600/5 text-portal-ink"
                                            : done
                                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                            : "border-slate-200 bg-slate-50/50 text-slate-400"
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5">
                                          {done ? (
                                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                          ) : curr ? (
                                            <Clock className="h-3.5 w-3.5 shrink-0 animate-pulse text-portal-blue-600" />
                                          ) : (
                                            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[9px]">
                                              {step.order / 10}
                                            </span>
                                          )}
                                          <p className="font-bold leading-tight">{step.label}</p>
                                        </div>
                                        {step.at && (
                                          <p className="mt-1 text-[10px] opacity-70">
                                            {formatDate(step.at)}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* History log */}
                            {detail.history && detail.history.length > 0 && (
                              <div>
                                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                  Progress Log
                                </p>
                                <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                                  {detail.history.map((item, i) => (
                                    <div
                                      key={i}
                                      className="flex flex-col gap-1 px-4 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-portal-blue-600" />
                                        <span className="font-bold text-portal-ink">
                                          {item.stageLabel}
                                        </span>
                                        {item.note && (
                                          <span className="italic text-slate-500">
                                            — &ldquo;{item.note}&rdquo;
                                          </span>
                                        )}
                                      </div>
                                      <span className="pl-3.5 font-mono text-[11px] text-slate-400 sm:pl-0">
                                        {formatDate(item.at)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {(!detail.timeline || detail.timeline.length === 0) &&
                              (!detail.history || detail.history.length === 0) && (
                                <p className="text-center text-xs text-slate-400 py-4">
                                  No tracking data available yet.
                                </p>
                              )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
