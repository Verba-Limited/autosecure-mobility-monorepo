import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { FiAlertCircle, FiInbox, FiLoader, FiRefreshCw, FiX } from "react-icons/fi";

export function AdminPageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-[var(--admin-muted)]">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminEmptyState({ title, description, icon: Icon = FiInbox }: { title: string; description?: string; icon?: IconType }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--admin-line)] bg-white px-6 text-center">
      <Icon className="h-6 w-6 text-slate-400" aria-hidden="true" />
      <p className="mt-3 text-sm font-semibold">{title}</p>
      {description ? <p className="mt-1 max-w-md text-xs leading-5 text-[var(--admin-muted)]">{description}</p> : null}
    </div>
  );
}

export function AdminErrorState({ message, onRetry, onDismiss }: { message: string; onRetry?: () => void; onDismiss?: () => void }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
      <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="flex-1">{message}</span>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold hover:bg-red-100">
          <FiRefreshCw aria-hidden="true" /> Retry
        </button>
      ) : null}
      {onDismiss ? (
        <button type="button" onClick={onDismiss} aria-label="Dismiss error" className="rounded-lg p-1 hover:bg-red-100">
          <FiX aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

export function AdminLoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-64 items-center justify-center" role="status">
      <FiLoader className="h-7 w-7 animate-spin text-[var(--admin-gold)]" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function AdminConfirmationDialog({
  title,
  description,
  confirmLabel,
  isLoading = false,
  tone = "default",
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  isLoading?: boolean;
  tone?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-5" role="presentation">
      <button
        type="button"
        aria-label="Cancel action"
        className="absolute inset-0 bg-slate-950/55"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirmation-title"
        aria-describedby="admin-confirmation-description"
        className="relative w-full max-w-md rounded-2xl border border-[var(--admin-line)] bg-white p-6 shadow-2xl"
      >
        <h2 id="admin-confirmation-title" className="font-display text-xl font-bold">
          {title}
        </h2>
        <p id="admin-confirmation-description" className="mt-3 text-sm leading-6 text-[var(--admin-muted)]">
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex min-w-28 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60 ${tone === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-[var(--admin-navy)] hover:bg-[var(--admin-navy-soft)]"}`}
          >
            {isLoading ? <FiLoader className="animate-spin" aria-hidden="true" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
