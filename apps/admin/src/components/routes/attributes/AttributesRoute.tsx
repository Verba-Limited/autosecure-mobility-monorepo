"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { FiEdit2, FiLoader, FiLock, FiPlus, FiRefreshCw, FiTrash2, FiX } from "react-icons/fi";
import type {
  AdminAttribute,
  AdminAttributePayload,
  AdminAttributesQuery,
  AttributeDataType,
  JsonObject,
} from "@autosecure/api";
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

const dataTypes: AttributeDataType[] = ["STRING", "NUMBER", "BOOLEAN", "ENUM"];
const scopes = ["VEHICLE", "PART", "TYRE", "BATTERY", "ACCESSORY"] as const;
type BooleanFilter = "" | "true" | "false";

export function AttributesRoute() {
  const accessToken = useAdminAuthStore((state) => state.accessToken);
  const [attributes, setAttributes] = useState<AdminAttribute[]>([]);
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [group, setGroup] = useState("");
  const [scope, setScope] = useState("");
  const [filterable, setFilterable] = useState<BooleanFilter>("");
  const [comparable, setComparable] = useState<BooleanFilter>("");
  const [active, setActive] = useState<BooleanFilter>("");
  const [editing, setEditing] = useState<AdminAttribute | "new" | null>(null);
  const [deleting, setDeleting] = useState<AdminAttribute | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const query = useMemo<AdminAttributesQuery>(() => ({
    group: group || undefined,
    scope: scope || undefined,
    filterable: filterable ? filterable === "true" : undefined,
  }), [filterable, group, scope]);

  const loadAttributes = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError("");
    try {
      const response = await adminApi.getAttributes(accessToken, query);
      setAttributes(response.data);
      setAvailableGroups((current) => Array.from(new Set([...current, ...response.data.map((item) => item.group)])).sort());
    } catch (requestError) {
      setError(getAdminErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, query]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAttributes(), 0);
    return () => window.clearTimeout(timer);
  }, [loadAttributes]);

  const visibleAttributes = useMemo(() => attributes.filter((item) => {
    const matchesComparable = !comparable || item.comparable === (comparable === "true");
    const matchesActive = !active || item.isActive === (active === "true");
    return matchesComparable && matchesActive;
  }), [active, attributes, comparable]);

  async function openEditor(attribute: AdminAttribute) {
    if (!accessToken) return;
    setActionId(`detail:${attribute._id}`);
    try {
      const response = await adminApi.getAttribute(accessToken, attribute._id);
      setEditing(response.data);
    } catch (requestError) {
      notifyError(getAdminErrorMessage(requestError));
    } finally {
      setActionId(null);
    }
  }

  async function toggleActive(attribute: AdminAttribute) {
    if (!accessToken) return;
    setActionId(attribute._id);
    try {
      await adminApi.updateAttribute(accessToken, attribute._id, { isActive: !attribute.isActive });
      notifySuccess(attribute.isActive ? "Attribute deactivated." : "Attribute activated.");
      await loadAttributes();
    } catch (requestError) {
      notifyError(getAdminErrorMessage(requestError));
    } finally {
      setActionId(null);
    }
  }

  async function deleteAttribute() {
    if (!accessToken || !deleting || deleting.isCore) return;
    setActionId(deleting._id);
    try {
      await adminApi.deleteAttribute(accessToken, deleting._id);
      notifySuccess("Custom attribute deleted.");
      setDeleting(null);
      await loadAttributes();
    } catch (requestError) {
      notifyError(getAdminErrorMessage(requestError));
    } finally {
      setActionId(null);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Attributes"
        description="Define reusable specification fields for trim forms, catalog filters, and vehicle comparisons."
        actions={<button type="button" onClick={() => setEditing("new")} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--admin-navy)] px-4 text-sm font-bold text-white hover:bg-[var(--admin-navy-soft)]"><FiPlus aria-hidden="true" /> Add attribute</button>}
      />

      <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800">
        Core attributes are maintained by the platform. Their labels, units, ordering, active state, and filter/comparison behavior can be adjusted, but their identity and storage mapping cannot be changed or deleted.
      </div>

      <section aria-label="Attribute filters" className="mb-5 grid gap-3 rounded-2xl border border-[var(--admin-line)] bg-white p-4 sm:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_auto]">
        <FilterSelect label="Group" value={group} onChange={setGroup} options={availableGroups.map((value) => ({ value, label: formatLabel(value) }))} allLabel="All groups" />
        <FilterSelect label="Scope" value={scope} onChange={setScope} options={scopes.map((value) => ({ value, label: formatLabel(value) }))} allLabel="All scopes" />
        <FilterSelect label="Filter use" value={filterable} onChange={(value) => setFilterable(value as BooleanFilter)} options={[{ value: "true", label: "Filterable" }, { value: "false", label: "Not filterable" }]} allLabel="Any filter use" />
        <FilterSelect label="Comparison" value={comparable} onChange={(value) => setComparable(value as BooleanFilter)} options={[{ value: "true", label: "Comparable" }, { value: "false", label: "Not comparable" }]} allLabel="Any comparison" />
        <FilterSelect label="Status" value={active} onChange={(value) => setActive(value as BooleanFilter)} options={[{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }]} allLabel="Any status" />
        <button type="button" onClick={() => void loadAttributes()} disabled={isLoading} className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--admin-line)] px-3 text-sm font-bold hover:bg-slate-50 disabled:opacity-50"><FiRefreshCw className={isLoading ? "animate-spin" : ""} aria-hidden="true" /> Refresh</button>
      </section>

      {error ? (
        <AdminErrorState message={error} onRetry={() => void loadAttributes()} />
      ) : isLoading && !attributes.length ? (
        <AdminLoadingState label="Loading attributes" />
      ) : visibleAttributes.length ? (
        <section className="overflow-x-auto rounded-2xl border border-[var(--admin-line)] bg-white">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-[1.25fr_0.8fr_0.8fr_1fr_0.75fr_1.15fr] gap-4 bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--admin-muted)]"><span>Field</span><span>Group / type</span><span>Scopes</span><span>Usage</span><span>Status</span><span className="text-right">Actions</span></div>
            {visibleAttributes.map((attribute) => (
              <div key={attribute._id} className="grid grid-cols-[1.25fr_0.8fr_0.8fr_1fr_0.75fr_1.15fr] items-center gap-4 border-t border-[var(--admin-line)] px-5 py-4">
                <div className="min-w-0"><div className="flex items-center gap-2"><p className="truncate text-sm font-bold">{attribute.label}</p>{attribute.isCore ? <FiLock className="shrink-0 text-slate-400" aria-label="Core attribute" /> : null}</div><p className="mt-1 truncate font-mono text-xs text-[var(--admin-muted)]">{attribute.key} · {attribute.path}</p></div>
                <div><p className="text-sm font-semibold">{formatLabel(attribute.group)}</p><p className="mt-1 text-xs text-[var(--admin-muted)]">{formatLabel(attribute.dataType)}{attribute.unit ? ` / ${attribute.unit}` : ""}</p></div>
                <span className="text-xs leading-5 text-[var(--admin-muted)]">{attribute.scopes.map(formatLabel).join(", ")}</span>
                <div><p className="text-sm font-semibold">{usageLabel(attribute)}</p><p className="mt-1 text-xs text-[var(--admin-muted)]">Order {attribute.order}</p></div>
                <span className={`text-xs font-bold ${attribute.isActive ? "text-emerald-700" : "text-slate-500"}`}>{attribute.isActive ? "Active" : "Inactive"}</span>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => void toggleActive(attribute)} disabled={actionId === attribute._id} className="rounded-lg border border-[var(--admin-line)] px-2.5 py-2 text-xs font-bold hover:bg-slate-50 disabled:opacity-50">{actionId === attribute._id ? <FiLoader className="animate-spin" aria-label="Updating" /> : attribute.isActive ? "Deactivate" : "Activate"}</button>
                  <button type="button" onClick={() => void openEditor(attribute)} disabled={actionId === `detail:${attribute._id}`} aria-label={`Edit ${attribute.label}`} className="rounded-lg border border-[var(--admin-line)] p-2 hover:bg-slate-50 disabled:opacity-50">{actionId === `detail:${attribute._id}` ? <FiLoader className="animate-spin" aria-hidden="true" /> : <FiEdit2 aria-hidden="true" />}</button>
                  <button type="button" onClick={() => setDeleting(attribute)} disabled={attribute.isCore} aria-label={attribute.isCore ? `${attribute.label} is a protected core attribute` : `Delete ${attribute.label}`} title={attribute.isCore ? "Core attributes cannot be deleted" : "Delete attribute"} className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"><FiTrash2 aria-hidden="true" /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <AdminEmptyState title="No attributes found" description="No attribute definitions match the selected filters." />
      )}

      {editing ? <AttributeEditor key={editing === "new" ? "new" : editing._id} item={editing === "new" ? null : editing} accessToken={accessToken} onClose={() => setEditing(null)} onSaved={async () => { setEditing(null); await loadAttributes(); }} /> : null}
      {deleting ? <AdminConfirmationDialog title="Delete custom attribute?" description={`Delete “${deleting.label}”? Existing data stored at ${deleting.path} will no longer have an attribute definition.`} confirmLabel="Delete" tone="danger" isLoading={actionId === deleting._id} onCancel={() => setDeleting(null)} onConfirm={() => void deleteAttribute()} /> : null}
    </>
  );
}

function FilterSelect({ label, value, onChange, options, allLabel }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; allLabel: string }) {
  return <label className="text-xs font-bold text-[var(--admin-muted)]">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-[var(--admin-line)] bg-white px-3 text-sm font-semibold text-[var(--admin-ink)]"><option value="">{allLabel}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

function AttributeEditor({ item, accessToken, onClose, onSaved }: { item: AdminAttribute | null; accessToken: string | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const isCore = Boolean(item?.isCore);
  const [key, setKey] = useState(item?.key ?? "");
  const [label, setLabel] = useState(item?.label ?? "");
  const [group, setGroup] = useState(item?.group ?? "general");
  const [dataType, setDataType] = useState<AttributeDataType>(item?.dataType ?? "STRING");
  const [unit, setUnit] = useState(item?.unit ?? "");
  const [options, setOptions] = useState(item?.options.join("\n") ?? "");
  const [path, setPath] = useState(item?.path ?? "");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(item?.scopes ?? ["VEHICLE"]);
  const [filterable, setFilterable] = useState(item?.filterable ?? false);
  const [comparable, setComparable] = useState(item?.comparable ?? true);
  const [order, setOrder] = useState(String(item?.order ?? 0));
  const [isActive, setIsActive] = useState(item?.isActive ?? true);
  const [metadata, setMetadata] = useState(item?.metadata ? JSON.stringify(item.metadata, null, 2) : "");
  const [fieldError, setFieldError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function toggleScope(scope: string) {
    if (isCore) return;
    setSelectedScopes((current) => current.includes(scope) ? current.filter((value) => value !== scope) : [...current, scope]);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError("");
    const normalizedKey = key.trim();
    if (!normalizedKey || !/^[A-Za-z][A-Za-z0-9_]*$/.test(normalizedKey)) return setFieldError("Key must start with a letter and contain only letters, numbers, or underscores.");
    if (!label.trim()) return setFieldError("Enter a display label.");
    if (!group.trim()) return setFieldError("Enter an attribute group.");
    if (!selectedScopes.length) return setFieldError("Select at least one scope.");
    const parsedOrder = Number(order);
    if (!Number.isFinite(parsedOrder)) return setFieldError("Order must be a valid number.");
    const parsedOptions = options.split(/\r?\n|,/).map((value) => value.trim()).filter(Boolean);
    if (dataType === "ENUM" && !parsedOptions.length) return setFieldError("Enum attributes need at least one option.");
    let parsedMetadata: JsonObject | undefined;
    if (metadata.trim()) {
      try {
        const parsed = JSON.parse(metadata) as unknown;
        if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") return setFieldError("Metadata must be a JSON object.");
        parsedMetadata = parsed as JsonObject;
      } catch {
        return setFieldError("Metadata must be valid JSON.");
      }
    }
    if (!accessToken) return;
    const defaultPath = selectedScopes.includes("VEHICLE") ? `specs.attributes.${normalizedKey}` : `partSpecs.attributes.${normalizedKey}`;
    const payload: AdminAttributePayload = {
      key: normalizedKey,
      label: label.trim(),
      group: group.trim(),
      dataType,
      unit: dataType === "NUMBER" && unit.trim() ? unit.trim() : null,
      options: dataType === "ENUM" ? Array.from(new Set(parsedOptions)) : [],
      path: path.trim() || defaultPath,
      scopes: selectedScopes,
      filterable,
      comparable,
      order: parsedOrder,
      isActive,
      metadata: parsedMetadata,
    };
    setIsSaving(true);
    try {
      if (item?.isCore) {
        await adminApi.updateAttribute(accessToken, item._id, {
          label: payload.label,
          unit: payload.unit,
          order: payload.order,
          filterable: payload.filterable,
          comparable: payload.comparable,
          isActive: payload.isActive,
        });
      } else if (item) {
        const { key: _key, ...updates } = payload;
        void _key;
        await adminApi.updateAttribute(accessToken, item._id, updates);
      } else {
        await adminApi.createAttribute(accessToken, payload);
      }
      notifySuccess(item ? "Attribute updated." : "Attribute created.");
      await onSaved();
    } catch (requestError) {
      notifyError(getAdminErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50"><button type="button" aria-label="Close attribute editor" className="absolute inset-0 bg-slate-950/55" onClick={onClose} /><aside role="dialog" aria-modal="true" aria-labelledby="attribute-editor-title" className="absolute inset-y-0 right-0 w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-[var(--admin-line)] px-6 py-5"><div><h2 id="attribute-editor-title" className="font-display text-xl font-bold">{item ? "Edit attribute" : "Add attribute"}</h2>{isCore ? <p className="mt-1 text-xs text-[var(--admin-muted)]">Protected core definition</p> : null}</div><button type="button" onClick={onClose} aria-label="Close editor" className="rounded-lg p-2 hover:bg-slate-100"><FiX aria-hidden="true" /></button></div>
      <form onSubmit={submit} className="space-y-5 p-6">
        {isCore ? <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">The key, group, data type, path, scopes, options, and metadata are locked for core attributes.</div> : null}
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Key" value={key} onChange={setKey} disabled={Boolean(item)} placeholder="heatedSeats" mono /><Field label="Display label" value={label} onChange={setLabel} placeholder="Heated seats" /></div>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Group" value={group} onChange={setGroup} disabled={isCore} placeholder="comfort" /><label className="text-sm font-semibold">Data type<select value={dataType} disabled={isCore} onChange={(event) => setDataType(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[var(--admin-line)] bg-white px-3 disabled:bg-slate-100">{dataTypes.map((type) => <option key={type} value={type}>{formatLabel(type)}</option>)}</select></label></div>
        {dataType === "NUMBER" ? <Field label="Unit (optional)" value={unit} onChange={setUnit} placeholder="e.g. km, kg, kW" /> : null}
        {dataType === "ENUM" ? <label className="block text-sm font-semibold">Options <span className="font-normal text-[var(--admin-muted)]">(one per line or comma-separated)</span><textarea value={options} disabled={isCore} onChange={(event) => setOptions(event.target.value)} className="mt-2 min-h-28 w-full rounded-lg border border-[var(--admin-line)] p-3 font-mono text-sm disabled:bg-slate-100" placeholder={"AUTOMATIC\nMANUAL\nCVT"} /></label> : null}
        <Field label="Storage path" value={path} onChange={setPath} disabled={isCore} placeholder={selectedScopes.includes("VEHICLE") ? `specs.attributes.${key || "key"}` : `partSpecs.attributes.${key || "key"}`} mono hint="Leave blank to use the suggested dynamic attribute path." />
        <fieldset disabled={isCore}><legend className="text-sm font-semibold">Scopes</legend><div className="mt-2 flex flex-wrap gap-x-5 gap-y-3">{scopes.map((scope) => <label key={scope} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selectedScopes.includes(scope)} onChange={() => toggleScope(scope)} className="h-4 w-4" /> {formatLabel(scope)}</label>)}</div></fieldset>
        <div className="grid gap-4 sm:grid-cols-2"><label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={filterable} onChange={(event) => setFilterable(event.target.checked)} className="h-4 w-4" /> Available as a catalog filter</label><label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={comparable} onChange={(event) => setComparable(event.target.checked)} className="h-4 w-4" /> Included in comparisons</label></div>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Order" value={order} onChange={setOrder} inputType="number" /><label className="flex items-end gap-3 pb-3 text-sm font-semibold"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-4 w-4" /> Active</label></div>
        {!isCore ? <label className="block text-sm font-semibold">Metadata JSON <span className="font-normal text-[var(--admin-muted)]">(object only)</span><textarea value={metadata} onChange={(event) => setMetadata(event.target.value)} className="mt-2 min-h-32 w-full rounded-lg border border-[var(--admin-line)] p-3 font-mono text-sm" placeholder={JSON.stringify({ helpText: "Shown to administrators" })} /></label> : null}
        {fieldError ? <p role="alert" className="text-sm text-red-700">{fieldError}</p> : null}
        <div className="flex justify-end gap-3 border-t border-[var(--admin-line)] pt-5"><button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600">Cancel</button><button type="submit" disabled={isSaving} className="inline-flex min-w-28 items-center justify-center gap-2 rounded-lg bg-[var(--admin-navy)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{isSaving ? <FiLoader className="animate-spin" aria-hidden="true" /> : null}{item ? "Save changes" : "Create attribute"}</button></div>
      </form>
    </aside></div>
  );
}

function Field({ label, value, onChange, disabled = false, placeholder, mono = false, hint, inputType = "text" }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean; placeholder?: string; mono?: boolean; hint?: string; inputType?: "text" | "number" }) {
  return <label className="block text-sm font-semibold">{label}<input type={inputType} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`mt-2 h-11 w-full rounded-lg border border-[var(--admin-line)] px-3 outline-none focus:border-[var(--admin-gold)] disabled:bg-slate-100 ${mono ? "font-mono text-sm" : ""}`} />{hint ? <span className="mt-1 block text-xs font-normal text-[var(--admin-muted)]">{hint}</span> : null}</label>;
}

function usageLabel(attribute: AdminAttribute) {
  if (attribute.filterable && attribute.comparable) return "Filter and compare";
  if (attribute.filterable) return "Filter only";
  if (attribute.comparable) return "Compare only";
  return "Display only";
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}
