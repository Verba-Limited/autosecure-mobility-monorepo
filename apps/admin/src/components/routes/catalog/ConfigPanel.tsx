"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { FiEdit2, FiLoader, FiPlus, FiRefreshCw, FiTrash2, FiX } from "react-icons/fi";
import type { AdminConfigItem, AdminConfigType, JsonValue } from "@autosecure/api";
import {
  AdminConfirmationDialog,
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
} from "@/components/ui/AdminPrimitives";
import { adminApi, getAdminErrorMessage } from "@/lib/admin-api";
import { notifyError, notifySuccess } from "@/lib/admin-notifications";
import { useAdminAuthStore } from "@/stores/auth-store";

const configTypes: AdminConfigType[] = [
  "VEHICLE_BRAND",
  "VEHICLE_MODEL",
  "VEHICLE_CATEGORY",
  "PART_CATEGORY",
  "DELIVERY_OPTION",
  "PRICING_RULE",
];
const creatableConfigTypes: AdminConfigType[] = ["DELIVERY_OPTION", "PRICING_RULE"];

export function ConfigPanel() {
  const accessToken = useAdminAuthStore((state) => state.accessToken);
  const [items, setItems] = useState<AdminConfigItem[]>([]);
  const [typeFilter, setTypeFilter] = useState<AdminConfigType | "">("");
  const [editing, setEditing] = useState<AdminConfigItem | "new" | null>(null);
  const [deleting, setDeleting] = useState<AdminConfigItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadItems = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError("");
    try {
      const response = await adminApi.getConfig(accessToken, typeFilter || undefined);
      setItems(response.data);
    } catch (requestError) {
      setError(getAdminErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, typeFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadItems(), 0);
    return () => window.clearTimeout(timer);
  }, [loadItems]);

  async function toggleActive(item: AdminConfigItem) {
    if (!accessToken) return;
    setActionId(item._id);
    try {
      await adminApi.updateConfig(accessToken, item._id, { isActive: !item.isActive });
      notifySuccess(item.isActive ? "Configuration value deactivated." : "Configuration value activated.");
      await loadItems();
    } catch (requestError) {
      notifyError(getAdminErrorMessage(requestError));
    } finally {
      setActionId(null);
    }
  }

  async function deleteItem() {
    if (!accessToken || !deleting) return;
    setActionId(deleting._id);
    try {
      await adminApi.deleteConfig(accessToken, deleting._id);
      notifySuccess("Configuration value deleted.");
      setDeleting(null);
      await loadItems();
    } catch (requestError) {
      notifyError(getAdminErrorMessage(requestError));
    } finally {
      setActionId(null);
    }
  }

  return (
    <>
      <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800">
        New vehicle brands, models, categories, and part categories belong in Taxonomy. Platform configuration is reserved for delivery options, pricing rules, and other non-classification values.
      </div>
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-[var(--admin-line)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <label>
          <span className="sr-only">Filter configuration by type</span>
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as AdminConfigType | "")} className="h-10 rounded-lg border border-[var(--admin-line)] bg-white px-3 text-sm font-semibold outline-none focus:border-[var(--admin-gold)]">
            <option value="">All configuration types</option>
            {configTypes.map((type) => <option key={type} value={type}>{formatLabel(type)}</option>)}
          </select>
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={() => void loadItems()} disabled={isLoading} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--admin-line)] px-3 text-sm font-bold hover:bg-slate-50 disabled:opacity-50"><FiRefreshCw className={isLoading ? "animate-spin" : ""} aria-hidden="true" /> Refresh</button>
          <button type="button" onClick={() => setEditing("new")} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--admin-navy)] px-4 text-sm font-bold text-white hover:bg-[var(--admin-navy-soft)]"><FiPlus aria-hidden="true" /> Add value</button>
        </div>
      </div>
      {error ? (
        <AdminErrorState message={error} onRetry={() => void loadItems()} />
      ) : isLoading && !items.length ? (
        <AdminLoadingState label="Loading platform configuration" />
      ) : items.length ? (
        <section className="overflow-x-auto rounded-2xl border border-[var(--admin-line)] bg-white">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[1fr_1fr_0.55fr_0.8fr] gap-4 bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--admin-muted)]"><span>Value</span><span>Type</span><span>Status</span><span className="text-right">Actions</span></div>
            {items.map((item) => (
              <div key={item._id} className="grid grid-cols-[1fr_1fr_0.55fr_0.8fr] items-center gap-4 border-t border-[var(--admin-line)] px-5 py-4">
                <div className="min-w-0"><p className="truncate text-sm font-bold">{item.value}</p>{item.metadata !== undefined ? <p className="mt-1 truncate text-xs text-[var(--admin-muted)]">Metadata configured</p> : null}</div>
                <span className="text-sm text-[var(--admin-muted)]">{formatLabel(item.type)}</span>
                <span className={`text-xs font-bold ${item.isActive === false ? "text-slate-500" : "text-emerald-700"}`}>{item.isActive === false ? "Inactive" : "Active"}</span>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => void toggleActive(item)} disabled={actionId === item._id} className="rounded-lg border border-[var(--admin-line)] px-3 py-2 text-xs font-bold hover:bg-slate-50 disabled:opacity-50">{actionId === item._id ? <FiLoader className="animate-spin" aria-label="Updating" /> : item.isActive === false ? "Activate" : "Deactivate"}</button>
                  <button type="button" onClick={() => setEditing(item)} aria-label={`Edit ${item.value}`} className="rounded-lg border border-[var(--admin-line)] p-2 hover:bg-slate-50"><FiEdit2 aria-hidden="true" /></button>
                  <button type="button" onClick={() => setDeleting(item)} aria-label={`Delete ${item.value}`} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><FiTrash2 aria-hidden="true" /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : <AdminEmptyState title="No configuration values" description="No values match the selected type." />}

      {editing ? <ConfigEditor key={editing === "new" ? "new" : editing._id} item={editing === "new" ? null : editing} accessToken={accessToken} onClose={() => setEditing(null)} onSaved={async () => { setEditing(null); await loadItems(); }} /> : null}
      {deleting ? <AdminConfirmationDialog title="Delete configuration value?" description={`Delete “${deleting.value}”? This cannot be undone.`} confirmLabel="Delete" tone="danger" isLoading={actionId === deleting._id} onCancel={() => setDeleting(null)} onConfirm={() => void deleteItem()} /> : null}
    </>
  );
}

function ConfigEditor({ item, accessToken, onClose, onSaved }: { item: AdminConfigItem | null; accessToken: string | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const [type, setType] = useState<AdminConfigType>(item?.type ?? "DELIVERY_OPTION");
  const [value, setValue] = useState(item?.value ?? "");
  const [metadata, setMetadata] = useState(item?.metadata === undefined ? "" : JSON.stringify(item.metadata, null, 2));
  const [isActive, setIsActive] = useState(item?.isActive ?? true);
  const [fieldError, setFieldError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError("");
    if (!value.trim()) return setFieldError("Enter a configuration value.");
    let parsedMetadata: JsonValue | undefined;
    if (metadata.trim()) {
      try { parsedMetadata = JSON.parse(metadata) as JsonValue; }
      catch { return setFieldError("Metadata must be valid JSON."); }
    }
    if (!accessToken) return;
    setIsSaving(true);
    try {
      if (item) await adminApi.updateConfig(accessToken, item._id, { value: value.trim(), metadata: parsedMetadata, isActive });
      else await adminApi.createConfig(accessToken, { type, value: value.trim(), metadata: parsedMetadata, isActive });
      notifySuccess(item ? "Configuration value updated." : "Configuration value created.");
      await onSaved();
    } catch (requestError) { notifyError(getAdminErrorMessage(requestError)); }
    finally { setIsSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50"><button type="button" aria-label="Close editor" className="absolute inset-0 bg-slate-950/55" onClick={onClose} /><aside role="dialog" aria-modal="true" aria-labelledby="config-editor-title" className="absolute inset-y-0 right-0 w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-[var(--admin-line)] px-6 py-5"><h2 id="config-editor-title" className="font-display text-xl font-bold">{item ? "Edit configuration" : "Add configuration"}</h2><button type="button" onClick={onClose} aria-label="Close editor" className="rounded-lg p-2 hover:bg-slate-100"><FiX aria-hidden="true" /></button></div>
      <form onSubmit={submit} className="space-y-5 p-6">
        <label className="block text-sm font-semibold">Type<select value={type} disabled={Boolean(item)} onChange={(event) => setType(event.target.value as AdminConfigType)} className="mt-2 h-11 w-full rounded-lg border border-[var(--admin-line)] bg-white px-3 disabled:bg-slate-100">{(item ? configTypes : creatableConfigTypes).map((option) => <option key={option} value={option}>{formatLabel(option)}</option>)}</select></label>
        <label className="block text-sm font-semibold">Value<input value={value} onChange={(event) => setValue(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[var(--admin-line)] px-3 outline-none focus:border-[var(--admin-gold)]" /></label>
        <label className="block text-sm font-semibold">Metadata JSON<textarea value={metadata} onChange={(event) => setMetadata(event.target.value)} className="mt-2 min-h-36 w-full rounded-lg border border-[var(--admin-line)] p-3 font-mono text-sm outline-none focus:border-[var(--admin-gold)]" placeholder={'{"key": "value"}'} /></label>
        <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-4 w-4" /> Active</label>
        {fieldError ? <p role="alert" className="text-sm text-red-700">{fieldError}</p> : null}
        <div className="flex justify-end gap-3 border-t border-[var(--admin-line)] pt-5"><button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600">Cancel</button><button type="submit" disabled={isSaving} className="inline-flex min-w-28 items-center justify-center gap-2 rounded-lg bg-[var(--admin-navy)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{isSaving ? <FiLoader className="animate-spin" aria-hidden="true" /> : null}{item ? "Save changes" : "Create value"}</button></div>
      </form>
    </aside></div>
  );
}

function formatLabel(value: string) { return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()); }
