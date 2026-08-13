"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  Check,
  CircleDollarSign,
  ClipboardCheck,
  Loader2,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  Plus,
  Search,
  Settings2,
  Store,
  Trash2,
  Users,
  X,
  XCircle,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { adminApi, getAdminErrorMessage } from "@/lib/admin-api";
import { useAdminAuthStore } from "@/stores/auth-store";

type Tab = "overview" | "listings" | "suppliers" | "messages" | "config";
type RecordValue = Record<string, unknown>;
type ConfigType =
  | "VEHICLE_BRAND"
  | "VEHICLE_MODEL"
  | "VEHICLE_CATEGORY"
  | "PART_CATEGORY"
  | "DELIVERY_OPTION"
  | "PRICING_RULE";

function record(value: unknown): RecordValue {
  return value && typeof value === "object" ? (value as RecordValue) : {};
}
function unwrap(value: unknown): unknown {
  const item = record(value);
  return item.data ?? item.result ?? item.payload ?? value;
}
function items(value: unknown): RecordValue[] {
  const unwrapped = unwrap(value);
  if (Array.isArray(unwrapped)) return unwrapped.map(record);
  const item = record(unwrapped);
  for (const key of ["items", "results", "listings", "suppliers", "data"])
    if (Array.isArray(item[key])) return (item[key] as unknown[]).map(record);
  return [];
}
function isRecord(value: unknown): value is RecordValue {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function text(value: unknown, fallback = "-"): string {
  if (value === null || value === undefined || value === "") return fallback;

  if (Array.isArray(value)) {
    for (const item of value) {
      const result = text(item, fallback);
      if (result !== fallback) return result;
    }
    return fallback;
  }

  if (isRecord(value)) {
    for (const key of [
      "name",
      "title",
      "companyName",
      "businessName",
      "contactPerson",
      "email",
      "contactEmail",
      "value",
      "label",
    ]) {
      if (typeof value[key] === "string" && value[key] !== "") {
        return value[key];
      }
    }
    return fallback;
  }

  return String(value);
}
function date(value: unknown): string {
  if (!value) return "-";
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime())
    ? text(value)
    : parsed.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}
function number(value: unknown): number {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}
function pick(item: RecordValue, keys: string[], fallback = "-") {
  for (const key of keys)
    if (item[key] !== undefined && item[key] !== null)
      return text(item[key], fallback);
  return fallback;
}

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "listings", label: "Listing review", icon: ClipboardCheck },
  { id: "suppliers", label: "Suppliers", icon: Store },
  { id: "messages", label: "Messages", icon: AlertCircle },
  { id: "config", label: "Catalog config", icon: Settings2 },
];

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

function Stat({
  label,
  value,
  detail,
  icon: Icon,
  tone = "gold",
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Users;
  tone?: "gold" | "blue" | "green" | "red";
}) {
  const tones = {
    gold: "bg-[#fff6df] text-[#a87513]",
    blue: "bg-[#eaf0ff] text-[#3158c9]",
    green: "bg-[#e8f8ef] text-[#21864a]",
    red: "bg-[#fff0ee] text-[#c8463b]",
  };
  return (
    <div className="rounded-2xl border border-[var(--admin-line)] bg-white p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--admin-muted)]">
          {label}
        </p>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-5 font-display text-3xl font-bold tracking-tight">
        {value}
      </p>
      <p className="mt-1 text-xs text-[var(--admin-muted)]">{detail}</p>
    </div>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-[var(--admin-line)] bg-white text-sm text-[var(--admin-muted)]">
      {message}
    </div>
  );
}

export function AdminClient({ accessToken }: { accessToken: string }) {
  const logout = useAdminAuthStore((state) => state.logout);
  const [tab, setTab] = useState<Tab>("overview");
  const [dashboard, setDashboard] = useState<unknown>(null);
  const [reports, setReports] = useState<unknown>(null);
  const [listingPayload, setListingPayload] = useState<unknown>(null);
  const [supplierPayload, setSupplierPayload] = useState<unknown>(null);
  const [configPayload, setConfigPayload] = useState<unknown>(null);
  const [statusFilter, setStatusFilter] = useState("PENDING_REVIEW");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [rejecting, setRejecting] = useState<RecordValue | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [configType, setConfigType] = useState<ConfigType>("VEHICLE_BRAND");
  const [configValue, setConfigValue] = useState("");
  const [messagesPayload, setMessagesPayload] = useState<unknown>(null);
  const [messagesStatsPayload, setMessagesStatsPayload] =
    useState<unknown>(null);
  const [messageQuery, setMessageQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<unknown | null>(null);
  const [actionKey, setActionKey] = useState<string | null>(null);

  const loadData = useCallback(
    async (showPageLoader = true) => {
      if (showPageLoader) setIsLoading(true);
      setError("");
      try {
        const [
          dashboardResult,
          reportsResult,
          listingsResult,
          suppliersResult,
          messagesResult,
          messagesStatsResult,
          configResult,
        ] = await Promise.all([
          adminApi.getDashboard(accessToken),
          adminApi.getReports(accessToken),
          adminApi.getListings(accessToken, statusFilter),
          adminApi.getSuppliers(accessToken, 1, 25),
          adminApi.getContactMessages(accessToken, 1, 10),
          adminApi.getContactMessagesStats(accessToken),
          adminApi.getConfig(accessToken),
        ]);
        setDashboard(dashboardResult);
        setReports(reportsResult);
        setListingPayload(listingsResult);
        setSupplierPayload(suppliersResult);
        setMessagesPayload(messagesResult as unknown);
        setMessagesStatsPayload(messagesStatsResult as unknown);
        setConfigPayload(configResult);
      } catch (requestError) {
        setError(getAdminErrorMessage(requestError));
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken, statusFilter],
  );
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const dashboardRecord = record(unwrap(dashboard));
  const reportRecord = record(unwrap(reports));
  const allListings = useMemo(() => items(listingPayload), [listingPayload]);
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
  const suppliers = useMemo(
    () =>
      items(supplierPayload).filter(
        (item) =>
          !query ||
          JSON.stringify(item).toLowerCase().includes(query.toLowerCase()),
      ),
    [supplierPayload, query],
  );
  const messages = useMemo(
    () =>
      items(messagesPayload).filter(
        (item) =>
          !messageQuery ||
          JSON.stringify(item)
            .toLowerCase()
            .includes(messageQuery.toLowerCase()),
      ),
    [messagesPayload, messageQuery],
  );
  const messagesStats = record(unwrap(messagesStatsPayload));
  const selectedDoc: RecordValue | null = selectedMessage
    ? record(
        record(unwrap(selectedMessage))._doc ?? record(unwrap(selectedMessage)),
      )
    : null;
  const configs = items(configPayload);
  const dashboardNumber = (keys: string[]) => {
    for (const key of keys)
      if (dashboardRecord[key] !== undefined)
        return number(dashboardRecord[key]);
    return 0;
  };
  const listingStatusCounts = record(dashboardRecord.listings);
  const listingCount =
    dashboardNumber(["totalListings", "inventoryCount"]) ||
    Object.values(listingStatusCounts).reduce<number>(
      (total, value) => total + number(value),
      0,
    ) ||
    allListings.length;
  const pendingCount =
    dashboardNumber(["pendingListings", "pendingReview", "pending"]) ||
    allListings.filter(
      (item) => pick(item, ["status"], "") === "PENDING_REVIEW",
    ).length;
  const supplierCount =
    dashboardNumber(["totalSuppliers", "suppliers", "supplierCount"]) ||
    suppliers.length;

  async function runAction(
    action: () => Promise<unknown>,
    success: string,
    key: string,
  ) {
    setError("");
    setActionKey(key);
    try {
      await action();
      setNotice(success);
      await loadData(false);
      setTimeout(() => setNotice(""), 3500);
    } catch (requestError) {
      setError(getAdminErrorMessage(requestError));
    } finally {
      setActionKey(null);
    }
  }
  function itemId(item: RecordValue) {
    return text(item.id ?? item._id ?? item.listingId, "");
  }

  return (
    <div className="min-h-screen bg-[var(--admin-paper)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[var(--admin-navy)] text-white lg:flex">
        <div className="border-b border-white/10 px-7 py-7">
          <p className="font-display text-xl font-bold tracking-tight">
            autoSecure<span className="text-[var(--admin-gold)]">.</span>
          </p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
            Operations console
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-7">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${tab === id ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {id === "listings" && pendingCount > 0 && (
                <span className="ml-auto rounded-full bg-[var(--admin-gold)] px-2 py-0.5 text-[10px] text-[var(--admin-navy)]">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--admin-gold)] font-bold text-[var(--admin-navy)]">
              A
            </div>
            <div>
              <p className="text-sm font-semibold">Administrator</p>
              <p className="text-xs text-slate-500">Full access</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[var(--admin-line)] bg-white/90 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-slate-500 lg:hidden"
              onClick={() => setTab(tab)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--admin-gold)]">
                Tuesday, August 11, 2026
              </p>
              <h1 className="font-display text-xl font-bold">
                {tabs.find((item) => item.id === tab)?.label}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 text-xs font-semibold text-emerald-700 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Services
              operational
            </span>
            <button
              onClick={() => void loadData(false)}
              className="rounded-lg border border-[var(--admin-line)] px-3 py-2 text-xs font-bold text-[var(--admin-ink)] hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] p-5 sm:p-8">
          {error && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              {error}
              <button className="ml-auto" onClick={() => setError("")}>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {notice && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <Check className="h-4 w-4" />
              {notice}
            </div>
          )}
          {isLoading ? (
            <div className="flex min-h-96 items-center justify-center">
              <Loader2
                className="h-7 w-7 animate-spin text-[var(--admin-gold)]"
                aria-label="Loading operations data"
              />
            </div>
          ) : tab === "overview" ? (
            <Overview
              dashboard={dashboardRecord}
              reports={reportRecord}
              listingCount={listingCount}
              pendingCount={pendingCount}
              supplierCount={supplierCount}
              onReview={() => setTab("listings")}
            />
          ) : tab === "listings" ? (
            <ListingReview
              listings={listings}
              filter={statusFilter}
              setFilter={setStatusFilter}
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
            />
          ) : tab === "suppliers" ? (
            <SupplierReview
              suppliers={suppliers}
              query={query}
              setQuery={setQuery}
              itemId={itemId}
              actionKey={actionKey}
              onStatus={(id, status) =>
                runAction(
                  () => adminApi.updateSupplierStatus(accessToken, id, status),
                  `Supplier marked ${status.toLowerCase()}.`,
                  `supplier:${id}`,
                )
              }
            />
          ) : tab === "messages" ? (
            <MessagesReview
              messages={messages}
              stats={messagesStats}
              query={messageQuery}
              setQuery={setMessageQuery}
              actionKey={actionKey}
              onView={(id) => {
                setError("");
                setActionKey(`message:view:${id}`);
                adminApi
                  .getContactMessage(accessToken, id)
                  .then((res) => setSelectedMessage(res))
                  .catch((err) => setError(getAdminErrorMessage(err)))
                  .finally(() => setActionKey(null));
              }}
              onStatus={(id, status) =>
                runAction(
                  () =>
                    adminApi.updateContactMessageStatus(
                      accessToken,
                      id,
                      status,
                    ),
                  `Message marked ${status.toLowerCase()}.`,
                  `message:${id}`,
                )
              }
            />
          ) : (
            <ConfigManager
              configs={configs}
              type={configType}
              setType={setConfigType}
              value={configValue}
              setValue={setConfigValue}
              onCreate={async () => {
                if (!configValue.trim()) return;
                await runAction(
                  () =>
                    adminApi.createConfig(accessToken, {
                      type: configType,
                      value: configValue.trim(),
                    }),
                  "Configuration value added.",
                  "config:create",
                );
                setConfigValue("");
              }}
              onDelete={(id) =>
                runAction(
                  () => adminApi.deleteConfig(accessToken, id),
                  "Configuration value removed.",
                  `config:delete:${id}`,
                )
              }
              itemId={itemId}
              actionKey={actionKey}
            />
          )}
        </main>
      </div>
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
      {selectedMessage && selectedDoc ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--admin-navy)]/60 p-5">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--admin-muted)]">
                  Message detail
                </p>
                <h2 className="mt-2 font-display text-xl font-bold">
                  {pick(selectedDoc, ["subject"], "Message")}
                </h2>
                <p className="mt-1 text-xs text-[var(--admin-muted)]">
                  From {pick(selectedDoc, ["name", "email"], "Unknown")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusPill value={pick(selectedDoc, ["status"], "NEW")} />
                <button onClick={() => setSelectedMessage(null)}>
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-[var(--admin-line)] bg-white p-4 text-sm text-[var(--admin-muted)]">
                {pick(selectedDoc, ["message"], "-")}
              </div>
              <div className="flex gap-2">
                <button
                  disabled={actionKey === `message:${selectedDoc._id}`}
                  onClick={() => {
                    const id = String(selectedDoc._id ?? "");
                    void runAction(
                      () =>
                        adminApi.updateContactMessageStatus(
                          accessToken,
                          id,
                          "IN_PROGRESS",
                        ),
                      "Message marked in progress.",
                      `message:${id}`,
                    );
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-bold bg-amber-50 text-amber-700"
                >
                  {actionKey === `message:${selectedDoc._id}` ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Mark in progress"
                  )}
                </button>
                <button
                  disabled={actionKey === `message:${selectedDoc._id}`}
                  onClick={() => {
                    const id = String(selectedDoc._id ?? "");
                    void runAction(
                      () =>
                        adminApi.updateContactMessageStatus(
                          accessToken,
                          id,
                          "RESOLVED",
                        ),
                      "Message marked resolved.",
                      `message:${id}`,
                    );
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-bold bg-emerald-50 text-emerald-700"
                >
                  {actionKey === `message:${selectedDoc._id}` ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Mark resolved"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Overview({
  dashboard,
  reports,
  listingCount,
  pendingCount,
  supplierCount,
  onReview,
}: {
  dashboard: RecordValue;
  reports: RecordValue;
  listingCount: number;
  pendingCount: number;
  supplierCount: number;
  onReview: () => void;
}) {
  const report = (keys: string[]) => {
    for (const key of keys) {
      const value = reports[key];
      if (Array.isArray(value))
        return value.reduce(
          (total, item) =>
            total + number(record(item).count ?? record(item).views),
          0,
        );
      if (value !== undefined) return number(value);
    }
    return 0;
  };
  const recent = (
    items(dashboard.recentListings ?? dashboard.latestListings).length
      ? items(dashboard.recentListings ?? dashboard.latestListings)
      : items(reports.mostViewedProducts)
  ).slice(0, 5);
  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--admin-gold)]">
            Good morning, admin
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight">
            Marketplace at a glance
          </h2>
          <p className="mt-2 text-sm text-[var(--admin-muted)]">
            The decisions that need your attention, in one place.
          </p>
        </div>
        <button
          onClick={onReview}
          className="flex items-center justify-center gap-2 rounded-xl bg-[var(--admin-navy)] px-4 py-3 text-sm font-bold text-white hover:bg-[var(--admin-navy-soft)]"
        >
          Review queue <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Total listings"
          value={String(listingCount)}
          detail="Across the live catalog"
          icon={PackageCheck}
          tone="blue"
        />
        <Stat
          label="Needs review"
          value={String(pendingCount)}
          detail="Pending admin decision"
          icon={ClipboardCheck}
          tone="gold"
        />
        <Stat
          label="Active suppliers"
          value={String(supplierCount)}
          detail="Businesses on the platform"
          icon={Users}
          tone="green"
        />
        <Stat
          label="Reported activity"
          value={String(report(["totalReports", "reports", "flagged"]))}
          detail="Reports requiring follow-up"
          icon={BarChart3}
          tone="red"
        />
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-2xl border border-[var(--admin-line)] bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">
                Latest marketplace activity
              </h3>
              <p className="mt-1 text-xs text-[var(--admin-muted)]">
                The most recent listing movement
              </p>
            </div>
            <ActivityIcon />
          </div>
          {recent.length ? (
            <div className="space-y-1">
              {recent.map((item, index) => (
                <div
                  key={itemIdFor(item, index)}
                  className="flex items-center justify-between border-t border-[var(--admin-line)] py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">
                      {pick(
                        item,
                        ["title", "name", "model"],
                        "Untitled listing",
                      )}
                    </p>
                    <p className="mt-1 text-xs text-[var(--admin-muted)]">
                      {pick(
                        item,
                        ["supplierName", "supplier", "brand"],
                        "Supplier",
                      )}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <StatusPill
                      value={pick(item, ["status"], "PENDING_REVIEW")}
                    />
                    <p className="mt-1 text-[11px] text-[var(--admin-muted)]">
                      {date(item.createdAt ?? item.updatedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty message="Recent activity will appear here once the API returns listings." />
          )}
        </section>
        <section className="rounded-2xl bg-[var(--admin-navy)] p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--admin-gold)]">
            Reports snapshot
          </p>
          <h3 className="mt-3 font-display text-2xl font-bold">
            A healthier marketplace is a visible one.
          </h3>
          <div className="mt-8 space-y-5">
            <Metric label="Views" value={report(["views", "totalViews"])} />
            <Metric
              label="Inquiries"
              value={report(["inquiries", "leads", "totalLeads"])}
            />
            <Metric
              label="Approvals"
              value={report(["approvals", "approved"])}
            />
          </div>
        </section>
      </div>
    </>
  );
}
function ActivityIcon() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#3158c9]">
      <BarChart3 className="h-4 w-4" />
    </span>
  );
}
function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <b>{value.toLocaleString()}</b>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-white/10">
        <div className="h-1.5 w-2/3 rounded-full bg-[var(--admin-gold)]" />
      </div>
    </div>
  );
}
function itemIdFor(item: RecordValue, index: number) {
  return text(item.id ?? item._id, `row-${index}`);
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
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <SectionIntro
        eyebrow="Moderation queue"
        title="Review listings"
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
        <div className="overflow-hidden rounded-2xl border border-[var(--admin-line)] bg-white">
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
                        <img
                          src={firstImage}
                          alt="Thumbnail"
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
                                <img
                                  src={img}
                                  alt={`Image ${i + 1}`}
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
        </div>
      ) : (
        <Empty message="No listings match this review filter." />
      )}
    </>
  );
}

function SupplierReview({
  suppliers,
  query,
  setQuery,
  itemId,
  actionKey,
  onStatus,
}: {
  suppliers: RecordValue[];
  query: string;
  setQuery: (value: string) => void;
  itemId: (item: RecordValue) => string;
  actionKey: string | null;
  onStatus: (id: string, status: string) => void;
}) {
  return (
    <>
      <SectionIntro
        eyebrow="Partner network"
        title="Suppliers"
        description="Approve trusted businesses and keep account status current."
      />
      <Toolbar query={query} setQuery={setQuery} />
      {suppliers.length ? (
        <div className="overflow-hidden rounded-2xl border border-[var(--admin-line)] bg-white">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[1.5fr_1.3fr_0.8fr_0.8fr] border-b border-[var(--admin-line)] bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
              <span>Business</span>
              <span>Contact</span>
              <span>Status</span>
              <span className="text-right">Manage</span>
            </div>
            {suppliers.map((item, index) => {
              const status = pick(
                item,
                ["status", "supplierStatus"],
                "PENDING",
              );
              const active =
                status.toUpperCase().includes("ACTIVE") ||
                status.toUpperCase().includes("APPROV");
              return (
                <div
                  key={itemIdFor(item, index)}
                  className="grid grid-cols-[1.5fr_1.3fr_0.8fr_0.8fr] items-center border-b border-[var(--admin-line)] px-5 py-4 last:border-0"
                >
                  <div>
                    <p className="text-sm font-bold">
                      {pick(
                        item,
                        ["companyName", "businessName", "name"],
                        "Unnamed supplier",
                      )}
                    </p>
                    <p className="mt-1 text-xs text-[var(--admin-muted)]">
                      Joined {date(item.createdAt ?? item.joinedAt)}
                    </p>
                  </div>
                  <p className="truncate text-sm text-slate-600">
                    {pick(item, ["email", "contactEmail"], "No email")}
                  </p>
                  <StatusPill value={status} />
                  <div className="flex justify-end">
                    <button
                      disabled={actionKey === `supplier:${itemId(item)}`}
                      onClick={() =>
                        onStatus(itemId(item), active ? "SUSPENDED" : "ACTIVE")
                      }
                      className={`rounded-lg px-3 py-2 text-xs font-bold ${active ? "bg-red-50 text-red-700 hover:bg-red-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}
                    >
                      {actionKey === `supplier:${itemId(item)}` ? (
                        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                      ) : active ? (
                        "Suspend"
                      ) : (
                        "Activate"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <Empty message="No suppliers match this search." />
      )}
    </>
  );
}

function MessagesReview({
  messages,
  stats,
  query,
  setQuery,
  actionKey,
  onView,
  onStatus,
}: {
  messages: RecordValue[];
  stats: RecordValue;
  query: string;
  setQuery: (v: string) => void;
  actionKey: string | null;
  onView: (id: string) => void;
  onStatus: (id: string, status: string) => void;
}) {
  return (
    <>
      <SectionIntro
        eyebrow="Support"
        title="Contact messages"
        description="View and triage messages sent by customers."
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Toolbar query={query} setQuery={setQuery} />
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <div className="rounded-2xl border border-[var(--admin-line)] bg-white p-3 text-sm">
            <div className="text-xs text-[var(--admin-muted)]">New</div>
            <div className="font-display text-lg font-bold">
              {String(stats.new ?? 0)}
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--admin-line)] bg-white p-3 text-sm">
            <div className="text-xs text-[var(--admin-muted)]">In progress</div>
            <div className="font-display text-lg font-bold">
              {String(stats.inProgress ?? 0)}
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--admin-line)] bg-white p-3 text-sm">
            <div className="text-xs text-[var(--admin-muted)]">Resolved</div>
            <div className="font-display text-lg font-bold">
              {String(stats.resolved ?? 0)}
            </div>
          </div>
        </div>
      </div>
      {messages.length ? (
        <div className="overflow-hidden rounded-2xl border border-[var(--admin-line)] bg-white">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[2fr_1fr_0.8fr_0.8fr] border-b border-[var(--admin-line)] bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
              <span>Subject</span>
              <span>From</span>
              <span>Submitted</span>
              <span className="text-right">Manage</span>
            </div>
            {messages.map((item, index) => (
              <div
                key={itemIdFor(item, index)}
                className="grid grid-cols-[2fr_1fr_0.8fr_0.8fr] items-center border-b border-[var(--admin-line)] px-5 py-4 last:border-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">
                    {pick(item, ["subject"], "No subject")}
                  </p>
                  <p className="mt-1 truncate text-xs text-[var(--admin-muted)]">
                    {pick(item, ["message"], "")}
                  </p>
                </div>
                <p className="truncate text-sm text-slate-600">
                  {pick(item, ["name", "email"], "Unknown")}
                </p>
                <p className="text-xs text-slate-500">{date(item.createdAt)}</p>
                <div className="flex justify-end gap-2">
                  <StatusPill value={pick(item, ["status"], "NEW")} />
                  <button
                    disabled={
                      actionKey === `message:view:${itemIdFor(item, index)}`
                    }
                    onClick={() => onView(itemIdFor(item, index))}
                    className="rounded-lg px-3 py-2 text-xs font-bold bg-white border border-[var(--admin-line)]"
                  >
                    {actionKey === `message:view:${itemIdFor(item, index)}` ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "View"
                    )}
                  </button>
                  <button
                    disabled={actionKey === `message:${itemIdFor(item, index)}`}
                    onClick={() =>
                      onStatus(itemIdFor(item, index), "IN_PROGRESS")
                    }
                    className="rounded-lg px-3 py-2 text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100"
                  >
                    {actionKey === `message:${itemIdFor(item, index)}` ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Triage"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Empty message="No messages found." />
      )}
    </>
  );
}

function ConfigManager({
  configs,
  type,
  setType,
  value,
  setValue,
  onCreate,
  onDelete,
  itemId,
  actionKey,
}: {
  configs: RecordValue[];
  type: ConfigType;
  setType: (value: ConfigType) => void;
  value: string;
  setValue: (value: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  itemId: (item: RecordValue) => string;
  actionKey: string | null;
}) {
  const visible = configs.filter((item) => !item.type || item.type === type);
  return (
    <>
      <SectionIntro
        eyebrow="Catalog controls"
        title="Configuration"
        description="Manage the values suppliers and customers use throughout the catalog."
      />
      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <section className="rounded-2xl border border-[var(--admin-line)] bg-white p-5">
          <label className="block text-xs font-bold uppercase tracking-[0.13em] text-[var(--admin-muted)]">
            Add a value
            <select
              value={type}
              onChange={(event) => setType(event.target.value as ConfigType)}
              className="mt-3 h-11 w-full rounded-lg border border-[var(--admin-line)] bg-white px-3 text-sm font-semibold outline-none"
            >
              <option value="VEHICLE_BRAND">Vehicle brand</option>
              <option value="VEHICLE_MODEL">Vehicle model</option>
              <option value="VEHICLE_CATEGORY">Vehicle category</option>
              <option value="PART_CATEGORY">Part category</option>
              <option value="DELIVERY_OPTION">Delivery option</option>
              <option value="PRICING_RULE">Pricing rule</option>
            </select>
          </label>
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onCreate();
            }}
            className="mt-3 h-11 w-full rounded-lg border border-[var(--admin-line)] px-3 text-sm outline-none focus:border-[var(--admin-gold)]"
            placeholder="e.g. Toyota"
          />
          <button
            disabled={actionKey === "config:create"}
            onClick={onCreate}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--admin-navy)] text-sm font-bold text-white hover:bg-[var(--admin-navy-soft)]"
          >
            {actionKey === "config:create" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4" /> Add value
              </>
            )}
          </button>
        </section>
        <section className="rounded-2xl border border-[var(--admin-line)] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">
                {type.replaceAll("_", " ")}
              </h3>
              <p className="mt-1 text-xs text-[var(--admin-muted)]">
                {visible.length} configured values
              </p>
            </div>
            <CircleDollarSign className="h-5 w-5 text-[var(--admin-gold)]" />
          </div>
          {visible.length ? (
            <div className="divide-y divide-[var(--admin-line)]">
              {visible.map((item, index) => (
                <div
                  key={itemIdFor(item, index)}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {pick(item, ["value", "name", "label"])}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[var(--admin-muted)]">
                      {pick(item, ["type"], type).replaceAll("_", " ")}
                    </p>
                  </div>
                  <button
                    title="Remove value"
                    disabled={actionKey === `config:delete:${itemId(item)}`}
                    onClick={() => onDelete(itemId(item))}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    {actionKey === `config:delete:${itemId(item)}` ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <Empty message="No values configured for this category." />
          )}
        </section>
      </div>
    </>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--admin-gold)]">
        {eyebrow}
      </p>
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
