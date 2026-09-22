"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiLoader,
  FiRefreshCw,
  FiSend,
  FiX,
} from "react-icons/fi";
import type { AdminNotification, PaginationMeta, SendAdminNotificationPayload } from "@autosecure/api";
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

const emptyMeta: PaginationMeta = {
  totalItems: 0,
  itemCount: 0,
  itemsPerPage: 20,
  totalPages: 1,
  currentPage: 1,
};

export function NotificationsRoute() {
  const accessToken = useAdminAuthStore((state) => state.accessToken);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [meta, setMeta] = useState(emptyMeta);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [confirmReadAll, setConfirmReadAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [readingAll, setReadingAll] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(
    async (showLoader = true) => {
      if (!accessToken) return;
      if (showLoader) setLoading(true);
      setError("");
      try {
        const [listResponse, countResponse] = await Promise.all([
          adminApi.getNotifications(accessToken, { page, limit, unreadOnly: unreadOnly || undefined }),
          adminApi.getNotificationUnreadCount(accessToken),
        ]);
        setNotifications(listResponse.data.items);
        setMeta(listResponse.data.meta);
        setUnreadCount(countResponse.data.unreadCount);
      } catch (requestError) {
        setError(getAdminErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    },
    [accessToken, limit, page, unreadOnly],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => void loadNotifications(), 0);
    return () => window.clearTimeout(timer);
  }, [loadNotifications]);

  async function markOneRead(notification: AdminNotification) {
    if (!accessToken || notification.isRead) return;
    setBusyId(notification._id);
    try {
      await adminApi.markNotificationRead(accessToken, notification._id);
      setNotifications((current) =>
        unreadOnly
          ? current.filter((item) => item._id !== notification._id)
          : current.map((item) => item._id === notification._id ? { ...item, isRead: true } : item),
      );
      setUnreadCount((current) => Math.max(0, current - 1));
      notifySuccess("Notification marked as read.");
      notifyShell();
      if (unreadOnly) await loadNotifications(false);
    } catch (requestError) {
      notifyError(getAdminErrorMessage(requestError));
    } finally {
      setBusyId("");
    }
  }

  async function markAllRead() {
    if (!accessToken) return;
    setReadingAll(true);
    try {
      const response = await adminApi.markAllNotificationsRead(accessToken);
      setUnreadCount(0);
      setNotifications((current) => unreadOnly ? [] : current.map((item) => ({ ...item, isRead: true })));
      setConfirmReadAll(false);
      notifySuccess(`${response.data.updated} notification${response.data.updated === 1 ? "" : "s"} marked as read.`);
      notifyShell();
      await loadNotifications(false);
    } catch (requestError) {
      notifyError(getAdminErrorMessage(requestError));
    } finally {
      setReadingAll(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Notifications"
        description="Review operational alerts and send targeted or audience-wide notifications."
        actions={
          <button type="button" onClick={() => setSendOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-[var(--admin-navy)] px-4 py-2 text-sm font-bold text-white">
            <FiSend aria-hidden="true" /> Send notification
          </button>
        }
      />

      <section className="mb-5 flex flex-col gap-4 rounded-2xl border border-[var(--admin-line)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 text-sm font-bold">
            <FiBell className="text-[var(--admin-gold)]" aria-hidden="true" />
            <span>{unreadCount} unread</span>
          </div>
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(event) => { setUnreadOnly(event.target.checked); setPage(1); }}
            />
            Unread only
          </label>
          <label className="text-sm text-slate-600">
            Show{" "}
            <select
              value={limit}
              onChange={(event) => { setLimit(Number(event.target.value)); setPage(1); }}
              className="h-9 rounded-lg border border-[var(--admin-line)] bg-white px-2"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void loadNotifications(false)} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold">
            <FiRefreshCw aria-hidden="true" /> Refresh
          </button>
          <button
            type="button"
            disabled={unreadCount === 0}
            onClick={() => setConfirmReadAll(true)}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiCheckCircle aria-hidden="true" /> Mark all read
          </button>
        </div>
      </section>

      {error ? (
        <AdminErrorState message={error} onRetry={() => void loadNotifications()} />
      ) : loading ? (
        <AdminLoadingState label="Loading notifications" />
      ) : notifications.length === 0 ? (
        <AdminEmptyState
          title={unreadOnly ? "No unread notifications" : "No notifications"}
          description={unreadOnly ? "All operational alerts have been reviewed." : "New operational alerts will appear here."}
          icon={FiBell}
        />
      ) : (
        <>
          <section className="overflow-hidden rounded-2xl border border-[var(--admin-line)] bg-white">
            {notifications.map((notification) => (
              <article
                key={notification._id}
                className={`flex flex-col gap-4 border-b border-[var(--admin-line)] px-5 py-5 last:border-b-0 sm:flex-row sm:items-start ${notification.isRead ? "bg-white" : "border-l-4 border-l-[var(--admin-gold)] bg-amber-50/30"}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h2 className="font-bold">{notification.title}</h2>
                    {!notification.isRead ? <span className="text-xs font-bold text-amber-800">Unread</span> : null}
                    <span className="text-xs font-semibold text-[var(--admin-muted)]">{notification.type}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{notification.body}</p>
                  <p className="mt-2 text-xs text-[var(--admin-muted)]">{formatDate(notification.createdAt)}</p>
                  {notification.data ? <NotificationMetadata data={notification.data} /> : null}
                </div>
                {!notification.isRead ? (
                  <button
                    type="button"
                    onClick={() => void markOneRead(notification)}
                    disabled={busyId === notification._id}
                    className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-50"
                  >
                    {busyId === notification._id ? <FiLoader className="animate-spin" /> : <FiCheck />}
                    Mark read
                  </button>
                ) : null}
              </article>
            ))}
          </section>
          <Pagination meta={meta} onPage={setPage} />
        </>
      )}

      {sendOpen ? (
        <SendNotificationDrawer
          accessToken={accessToken}
          onClose={() => setSendOpen(false)}
          onSent={(recipients) => {
            setSendOpen(false);
            notifySuccess(`Notification sent to ${recipients} recipient${recipients === 1 ? "" : "s"}.`);
          }}
        />
      ) : null}

      {confirmReadAll ? (
        <AdminConfirmationDialog
          title="Mark all notifications as read?"
          description={`This will update all ${unreadCount} unread notifications for your administrator account.`}
          confirmLabel="Mark all read"
          isLoading={readingAll}
          onConfirm={() => void markAllRead()}
          onCancel={() => setConfirmReadAll(false)}
        />
      ) : null}
    </>
  );
}

function SendNotificationDrawer({ accessToken, onClose, onSent }: {
  accessToken: string | null;
  onClose: () => void;
  onSent: (recipients: number) => void;
}) {
  const [audience, setAudience] = useState("USER");
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("GENERAL");
  const [validation, setValidation] = useState("");
  const [confirmBroadcast, setConfirmBroadcast] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !confirmBroadcast) onClose();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [confirmBroadcast, onClose]);

  function validate() {
    if (audience === "USER" && !userId.trim()) return "A user ID is required for an individual notification.";
    if (!title.trim()) return "Enter a notification title.";
    if (!body.trim()) return "Enter the notification message.";
    if (!type.trim()) return "Select or enter a notification type.";
    return "";
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const message = validate();
    if (message) {
      setValidation(message);
      return;
    }
    setValidation("");
    if (audience !== "USER") {
      setConfirmBroadcast(true);
      return;
    }
    void send();
  }

  async function send() {
    if (!accessToken) return;
    setConfirmBroadcast(false);
    setSaving(true);
    const payload: SendAdminNotificationPayload = {
      audience,
      userId: audience === "USER" ? userId.trim() : undefined,
      title: title.trim(),
      body: body.trim(),
      type: type.trim().toUpperCase(),
    };
    try {
      const response = await adminApi.sendNotification(accessToken, payload);
      onSent(response.data.recipients);
    } catch (requestError) {
      notifyError(getAdminErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close notification form" className="absolute inset-0 bg-slate-950/55" onClick={onClose} />
      <aside role="dialog" aria-modal="true" aria-label="Send notification" className="absolute inset-y-0 right-0 w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b px-6 py-5">
          <div><p className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">Outbound message</p><h2 className="mt-1 text-xl font-bold">Send notification</h2></div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 hover:bg-slate-100"><FiX /></button>
        </header>
        <form onSubmit={submit} className="space-y-5 p-6">
          {validation ? <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{validation}</p> : null}
          <Field label="Audience">
            <select value={audience} onChange={(event) => setAudience(event.target.value)} className="mt-2 h-11 w-full rounded-lg border px-3">
              <option value="USER">Individual user</option>
              <option value="CUSTOMERS">All customers</option>
            </select>
          </Field>
          {audience === "USER" ? <TextInput label="User ID" value={userId} onChange={setUserId} placeholder="User document ID" /> : (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">This is an audience-wide message. You will be asked to confirm before it is sent.</p>
          )}
          <TextInput label="Title" value={title} onChange={setTitle} maxLength={120} />
          <Field label="Message">
            <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={6} maxLength={1000} className="mt-2 w-full rounded-lg border px-3 py-2" />
          </Field>
          <Field label="Type">
            <select value={type} onChange={(event) => setType(event.target.value)} className="mt-2 h-11 w-full rounded-lg border px-3">
              <option value="GENERAL">General</option>
              <option value="SPECIAL_DEAL">Special deal</option>
              <option value="ORDER">Order</option>
              <option value="QUOTE">Quote</option>
              <option value="SYSTEM">System</option>
            </select>
          </Field>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={saving} className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600">Cancel</button>
            <button type="submit" disabled={saving} className="inline-flex min-w-32 items-center justify-center gap-2 rounded-lg bg-[var(--admin-navy)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
              {saving ? <FiLoader className="animate-spin" /> : <FiSend />} Send
            </button>
          </div>
        </form>
      </aside>
      {confirmBroadcast ? (
        <AdminConfirmationDialog
          title="Confirm audience-wide notification"
          description={`Send “${title.trim()}” to ${audienceLabel(audience)}? The backend will determine the final recipient count.`}
          confirmLabel="Send broadcast"
          isLoading={saving}
          onConfirm={() => void send()}
          onCancel={() => setConfirmBroadcast(false)}
        />
      ) : null}
    </div>
  );
}

function NotificationMetadata({ data }: { data: Record<string, unknown> }) {
  const values = Object.entries(data).filter(([, value]) => ["string", "number"].includes(typeof value));
  if (!values.length) return null;
  return (
    <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
      {values.map(([key, value]) => (
        <div key={key} className="flex gap-1 text-xs text-[var(--admin-muted)]">
          <dt className="font-semibold">{humanize(key)}:</dt><dd>{String(value)}</dd>
        </div>
      ))}
    </dl>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-semibold">{label}{children}</label>;
}
function TextInput({ label, value, onChange, placeholder, maxLength }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; maxLength?: number }) {
  return <label className="block text-sm font-semibold">{label}<input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} maxLength={maxLength} className="mt-2 h-11 w-full rounded-lg border px-3" /></label>;
}
function Pagination({ meta, onPage }: { meta: PaginationMeta; onPage: (page: number) => void }) {
  return <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--admin-muted)]"><span>{meta.totalItems} notification{meta.totalItems === 1 ? "" : "s"} · Page {meta.currentPage} of {Math.max(meta.totalPages, 1)}</span><div className="flex gap-2"><button type="button" disabled={meta.currentPage <= 1} onClick={() => onPage(meta.currentPage - 1)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 font-bold disabled:opacity-40"><FiChevronLeft /> Previous</button><button type="button" disabled={meta.currentPage >= meta.totalPages} onClick={() => onPage(meta.currentPage + 1)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 font-bold disabled:opacity-40">Next <FiChevronRight /></button></div></div>;
}
function audienceLabel(audience: string) {
  return audience === "CUSTOMERS" ? "all customers" : "the selected audience";
}
function humanize(value: string) {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ").toLowerCase();
}
function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
function notifyShell() {
  window.dispatchEvent(new Event("admin-notifications-changed"));
}
