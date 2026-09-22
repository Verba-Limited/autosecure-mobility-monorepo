"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiEye,
  FiInbox,
  FiMail,
  FiRefreshCw,
  FiSearch,
  FiX,
} from "react-icons/fi";
import type {
  AdminContactMessage,
  AdminContactMessageDocument,
  ContactMessageStats,
  ContactMessageStatus,
  PaginatedData,
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

export function MessagesRoute() {
  const accessToken = useAdminAuthStore((state) => state.accessToken);
  const [data, setData] = useState<PaginatedData<AdminContactMessage> | null>(null);
  const [stats, setStats] = useState<ContactMessageStats | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState<ContactMessageStatus | "">("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminContactMessage | null>(null);
  const [listError, setListError] = useState("");
  const [statsError, setStatsError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [isListLoading, setIsListLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadMessages = useCallback(
    async (showLoader = true) => {
      if (!accessToken) return;
      if (showLoader) setIsListLoading(true);
      setListError("");
      try {
        const response = await adminApi.getContactMessages(accessToken, {
          page,
          limit,
          status: status || undefined,
        });
        setData(response.data);
      } catch (error) {
        setListError(getAdminErrorMessage(error));
      } finally {
        setIsListLoading(false);
      }
    },
    [accessToken, limit, page, status],
  );

  const loadStats = useCallback(
    async (showLoader = true) => {
      if (!accessToken) return;
      if (showLoader) setIsStatsLoading(true);
      setStatsError("");
      try {
        const response = await adminApi.getContactMessagesStats(accessToken);
        setStats(response.data);
      } catch (error) {
        setStatsError(getAdminErrorMessage(error));
      } finally {
        setIsStatsLoading(false);
      }
    },
    [accessToken],
  );

  const loadDetail = useCallback(
    async (messageId: string, showLoader = true) => {
      if (!accessToken) return;
      if (showLoader) setIsDetailLoading(true);
      setDetailError("");
      try {
        const response = await adminApi.getContactMessage(accessToken, messageId);
        setDetail(unwrapMessageDocument(response.data));
      } catch (error) {
        setDetailError(getAdminErrorMessage(error));
      } finally {
        setIsDetailLoading(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => void loadMessages(), 0);
    return () => window.clearTimeout(timer);
  }, [loadMessages]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadStats(), 0);
    return () => window.clearTimeout(timer);
  }, [loadStats]);

  useEffect(() => {
    if (!selectedId) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedId(null);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [selectedId]);

  const visibleMessages = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return data?.items ?? [];
    return (data?.items ?? []).filter((message) =>
      [message.name, message.email, message.subject, message.message].some(
        (value) => value?.toLowerCase().includes(normalized),
      ),
    );
  }, [data, query]);

  function openMessage(message: AdminContactMessage) {
    setSelectedId(message._id);
    setDetail(null);
    void loadDetail(message._id);
  }

  async function changeStatus(nextStatus: ContactMessageStatus) {
    if (!selectedId || !accessToken) return;
    setIsUpdating(true);
    try {
      await adminApi.updateContactMessageStatus(accessToken, selectedId, nextStatus);
      notifySuccess(`Message marked ${formatStatus(nextStatus).toLowerCase()}.`);
      await Promise.all([
        loadMessages(false),
        loadStats(false),
        loadDetail(selectedId, false),
      ]);
    } catch (error) {
      notifyError(getAdminErrorMessage(error));
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
        title="Contact messages"
        description="Review customer support messages and keep their operational status current."
        actions={
          <button
            type="button"
            onClick={() => {
              void loadMessages();
              void loadStats();
            }}
            disabled={isListLoading || isStatsLoading}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--admin-line)] bg-white px-4 text-sm font-bold hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
          >
            <FiRefreshCw className={isListLoading || isStatsLoading ? "animate-spin" : ""} aria-hidden="true" />
            Refresh
          </button>
        }
      />

      <MessageStats stats={stats} isLoading={isStatsLoading} error={statsError} onRetry={() => void loadStats()} />

      <div className="mb-4 mt-6 flex flex-col gap-3 rounded-2xl border border-[var(--admin-line)] bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <label className="relative block w-full sm:max-w-sm">
            <span className="sr-only">Search messages on this page</span>
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
            <span className="sr-only">Filter messages by status</span>
            <select
              value={status}
              onChange={(event) => {
                setPage(1);
                setStatus(event.target.value as ContactMessageStatus | "");
              }}
              className="h-10 w-full rounded-lg border border-[var(--admin-line)] bg-white px-3 text-sm font-semibold outline-none focus:border-[var(--admin-gold)] sm:w-48"
            >
              <option value="">All statuses</option>
              <option value="NEW">New</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </label>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--admin-muted)]">
          <span>Text search applies to the loaded page.</span>
          <select
            value={limit}
            onChange={(event) => {
              setPage(1);
              setLimit(Number(event.target.value));
            }}
            aria-label="Messages per page"
            className="h-9 rounded-lg border border-[var(--admin-line)] bg-white px-2 font-semibold text-[var(--admin-ink)]"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {listError ? (
        <AdminErrorState message={listError} onRetry={() => void loadMessages()} />
      ) : isListLoading && !data ? (
        <AdminLoadingState label="Loading contact messages" />
      ) : visibleMessages.length ? (
        <section className="overflow-x-auto rounded-2xl border border-[var(--admin-line)] bg-white">
          <div className="min-w-[820px]">
            <div className="grid grid-cols-[1.5fr_1fr_0.75fr_0.65fr_0.35fr] gap-4 bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--admin-muted)]">
              <span>Message</span><span>Sender</span><span>Submitted</span><span>Status</span><span className="text-right">Action</span>
            </div>
            {visibleMessages.map((message) => (
              <div key={message._id} className="grid grid-cols-[1.5fr_1fr_0.75fr_0.65fr_0.35fr] items-center gap-4 border-t border-[var(--admin-line)] px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{message.subject || "No subject"}</p>
                  <p className="mt-1 truncate text-xs text-[var(--admin-muted)]">{message.message || "No message content"}</p>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{message.name || "Unknown sender"}</p>
                  <p className="mt-1 truncate text-xs text-[var(--admin-muted)]">{message.email || "No email"}</p>
                </div>
                <span className="text-xs text-[var(--admin-muted)]">{formatDate(message.createdAt)}</span>
                <MessageStatus status={message.status} />
                <div className="text-right">
                  <button type="button" onClick={() => openMessage(message)} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--admin-line)] px-3 py-2 text-xs font-bold hover:bg-slate-50">
                    <FiEye aria-hidden="true" /> Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <AdminEmptyState
          title="No contact messages found"
          description={data?.items.length ? "No messages on this page match the text search." : "No messages match the selected status and page."}
        />
      )}

      {meta ? (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[var(--admin-line)] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--admin-muted)]">Showing {startItem}-{endItem} of {meta.totalItems} messages</p>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">Page {meta.currentPage} of {Math.max(meta.totalPages, 1)}</span>
            <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={meta.currentPage <= 1 || isListLoading} aria-label="Previous message page" className="rounded-lg border border-[var(--admin-line)] p-2 hover:bg-slate-50 disabled:opacity-40"><FiChevronLeft aria-hidden="true" /></button>
            <button type="button" onClick={() => setPage((current) => Math.min(meta.totalPages, current + 1))} disabled={meta.currentPage >= meta.totalPages || isListLoading} aria-label="Next message page" className="rounded-lg border border-[var(--admin-line)] p-2 hover:bg-slate-50 disabled:opacity-40"><FiChevronRight aria-hidden="true" /></button>
          </div>
        </div>
      ) : null}

      {selectedId ? (
        <MessageDrawer
          detail={detail}
          error={detailError}
          isLoading={isDetailLoading}
          isUpdating={isUpdating}
          onClose={() => {
            setSelectedId(null);
            setDetail(null);
          }}
          onRetry={() => void loadDetail(selectedId)}
          onChangeStatus={(nextStatus) => void changeStatus(nextStatus)}
        />
      ) : null}
    </>
  );
}

function MessageStats({ stats, isLoading, error, onRetry }: { stats: ContactMessageStats | null; isLoading: boolean; error: string; onRetry: () => void }) {
  if (error && !stats) return <AdminErrorState message={error} onRetry={onRetry} />;
  const values = [
    { label: "New", value: stats?.new, icon: FiInbox },
    { label: "In progress", value: stats?.inProgress, icon: FiClock },
    { label: "Resolved", value: stats?.resolved, icon: FiCheckCircle },
    { label: "Total", value: stats?.total, icon: FiMail },
  ];
  return (
    <>
      {error ? <div className="mb-3"><AdminErrorState message={error} onRetry={onRetry} /></div> : null}
      <section aria-label="Contact message statistics" className="grid overflow-hidden rounded-2xl border border-[var(--admin-line)] bg-white sm:grid-cols-4">
        {values.map(({ label, value, icon: Icon }, index) => (
          <div key={label} className={`flex items-center gap-3 px-5 py-4 ${index > 0 ? "border-t border-[var(--admin-line)] sm:border-l sm:border-t-0" : ""}`}>
            <Icon className="h-4 w-4 text-[var(--admin-gold)]" aria-hidden="true" />
            <div><p className="text-xs text-[var(--admin-muted)]">{label}</p><p className="font-display text-xl font-bold">{isLoading && value === undefined ? "—" : value ?? 0}</p></div>
          </div>
        ))}
      </section>
    </>
  );
}

function MessageDrawer({ detail, error, isLoading, isUpdating, onClose, onRetry, onChangeStatus }: { detail: AdminContactMessage | null; error: string; isLoading: boolean; isUpdating: boolean; onClose: () => void; onRetry: () => void; onChangeStatus: (status: ContactMessageStatus) => void }) {
  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <button type="button" aria-label="Close message" className="absolute inset-0 bg-slate-950/55" onClick={onClose} />
      <aside role="dialog" aria-modal="true" aria-labelledby="message-detail-title" className="absolute inset-y-0 right-0 w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[var(--admin-line)] bg-white px-6 py-5">
          <div className="min-w-0 pr-4">
            <h2 id="message-detail-title" className="truncate font-display text-xl font-bold">{detail?.subject || "Message detail"}</h2>
            {detail ? <div className="mt-2"><MessageStatus status={detail.status} /></div> : null}
          </div>
          <button type="button" onClick={onClose} aria-label="Close message" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><FiX aria-hidden="true" /></button>
        </div>
        <div className="p-6">
          {isLoading && !detail ? (
            <AdminLoadingState label="Loading message detail" />
          ) : error && !detail ? (
            <AdminErrorState message={error} onRetry={onRetry} />
          ) : detail ? (
            <div className="space-y-6">
              {error ? <AdminErrorState message={error} onRetry={onRetry} /> : null}
              <dl className="grid gap-4 rounded-xl border border-[var(--admin-line)] bg-slate-50 p-4 sm:grid-cols-2">
                <MessageDetail label="From" value={detail.name || "Unknown sender"} />
                <MessageDetail label="Email" value={detail.email || "Not provided"} />
                <MessageDetail label="Submitted" value={formatDate(detail.createdAt)} />
                <MessageDetail label="Email delivery" value={detail.emailDelivered ? "Delivered" : "Not delivered"} />
              </dl>
              <section>
                <h3 className="text-sm font-bold">Message</h3>
                <p className="mt-3 whitespace-pre-wrap break-words rounded-xl border border-[var(--admin-line)] p-4 text-sm leading-7">{detail.message || "No message content provided."}</p>
              </section>
              <section className="border-t border-[var(--admin-line)] pt-5">
                <h3 className="text-sm font-bold">Update status</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(["NEW", "IN_PROGRESS", "RESOLVED"] as ContactMessageStatus[]).map((nextStatus) => (
                    <button
                      key={nextStatus}
                      type="button"
                      onClick={() => onChangeStatus(nextStatus)}
                      disabled={isUpdating || detail.status === nextStatus}
                      className="inline-flex items-center gap-2 rounded-lg border border-[var(--admin-line)] px-3 py-2 text-sm font-bold hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      {nextStatus === "RESOLVED" ? <FiCheckCircle aria-hidden="true" /> : nextStatus === "IN_PROGRESS" ? <FiClock aria-hidden="true" /> : <FiInbox aria-hidden="true" />}
                      {formatStatus(nextStatus)}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function MessageDetail({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-semibold text-[var(--admin-muted)]">{label}</dt><dd className="mt-1 break-words text-sm font-medium">{value}</dd></div>;
}

function MessageStatus({ status }: { status: ContactMessageStatus }) {
  const style = status === "RESOLVED" ? "bg-emerald-50 text-emerald-700" : status === "IN_PROGRESS" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${style}`}>{formatStatus(status)}</span>;
}

function unwrapMessageDocument(value: AdminContactMessageDocument) {
  return "_doc" in value ? value._doc : value;
}

function formatStatus(value: ContactMessageStatus) {
  return value.replaceAll("_", " ").toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
}

function formatDate(value?: string) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
}
