"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiEdit2,
  FiLoader,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import {
  ApiError,
  type AdminTaxonomyPayload,
  type AdminTaxonomyQuery,
  type AdminTaxonomyTerm,
  type JsonObject,
  type ReorderItem,
} from "@autosecure/api";
import {
  AdminConfirmationDialog,
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
} from "@/components/ui/AdminPrimitives";
import { adminApi, getAdminErrorMessage } from "@/lib/admin-api";
import { notifyError, notifySuccess, notifyWarning } from "@/lib/admin-notifications";
import { useAdminAuthStore } from "@/stores/auth-store";

const taxonomyKinds = [
  "BRAND",
  "MODEL",
  "VEHICLE_CATEGORY",
  "VEHICLE_SUBCATEGORY",
  "VEHICLE_TYPE",
  "POWERTRAIN",
  "BODY_TYPE",
  "DRIVE_TYPE",
  "USE_CASE",
  "PART_CATEGORY",
] as const;

type ActiveFilter = "" | "true" | "false";

export function TaxonomyPanel() {
  const accessToken = useAdminAuthStore((state) => state.accessToken);
  const [terms, setTerms] = useState<AdminTaxonomyTerm[]>([]);
  const [parentOptions, setParentOptions] = useState<AdminTaxonomyTerm[]>([]);
  const [kind, setKind] = useState("");
  const [parent, setParent] = useState("");
  const [active, setActive] = useState<ActiveFilter>("");
  const [searchDraft, setSearchDraft] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<AdminTaxonomyTerm | "new" | null>(null);
  const [deleting, setDeleting] = useState<AdminTaxonomyTerm | null>(null);
  const [conflictTerm, setConflictTerm] = useState<AdminTaxonomyTerm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filters = useMemo<AdminTaxonomyQuery>(() => ({
    kind: kind || undefined,
    parent: parent || undefined,
    isActive: active ? active === "true" : undefined,
    q: query || undefined,
  }), [active, kind, parent, query]);

  const loadTerms = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError("");
    try {
      const response = await adminApi.getTaxonomy(accessToken, filters);
      setTerms(response.data);
    } catch (requestError) {
      setError(getAdminErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, filters]);

  const loadParentOptions = useCallback(async () => {
    if (!accessToken) return;
    try {
      const response = await adminApi.getTaxonomy(accessToken);
      setParentOptions(response.data);
    } catch {
      // The main list keeps the actionable page-level error. Parent choices can retry on refresh.
    }
  }, [accessToken]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadTerms(), 0);
    return () => window.clearTimeout(timer);
  }, [loadTerms]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadParentOptions(), 0);
    return () => window.clearTimeout(timer);
  }, [loadParentOptions]);

  const parentNames = useMemo(
    () => new Map(parentOptions.map((term) => [term._id, term.name])),
    [parentOptions],
  );
  const canReorder = Boolean(kind) && !query && !active;

  async function openEditor(term: AdminTaxonomyTerm) {
    if (!accessToken) return;
    setActionId(`detail:${term._id}`);
    try {
      const response = await adminApi.getTaxonomyTerm(accessToken, term._id);
      setEditing(response.data);
    } catch (requestError) {
      notifyError(getAdminErrorMessage(requestError));
    } finally {
      setActionId(null);
    }
  }

  async function toggleActive(term: AdminTaxonomyTerm) {
    if (!accessToken) return;
    setActionId(term._id);
    try {
      await adminApi.updateTaxonomyTerm(accessToken, term._id, { isActive: !term.isActive });
      notifySuccess(term.isActive ? "Taxonomy term deactivated." : "Taxonomy term activated.");
      await Promise.all([loadTerms(), loadParentOptions()]);
    } catch (requestError) {
      notifyError(getAdminErrorMessage(requestError));
    } finally {
      setActionId(null);
    }
  }

  async function reorderTerm(index: number, direction: -1 | 1) {
    if (!accessToken || !canReorder) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= terms.length) return;
    const reordered = [...terms];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    const payload: ReorderItem[] = reordered.map((term, itemIndex) => ({
      id: term._id,
      order: (itemIndex + 1) * 10,
    }));
    setActionId("reorder");
    try {
      const response = await adminApi.reorderTaxonomyTerms(accessToken, payload);
      notifySuccess(`${response.data.modified} taxonomy order value${response.data.modified === 1 ? "" : "s"} updated.`);
      await loadTerms();
    } catch (requestError) {
      notifyError(getAdminErrorMessage(requestError));
    } finally {
      setActionId(null);
    }
  }

  async function deleteTerm() {
    if (!accessToken || !deleting) return;
    const term = deleting;
    setActionId(term._id);
    try {
      await adminApi.deleteTaxonomyTerm(accessToken, term._id);
      notifySuccess("Taxonomy term deleted.");
      setDeleting(null);
      await Promise.all([loadTerms(), loadParentOptions()]);
    } catch (requestError) {
      setDeleting(null);
      if (requestError instanceof ApiError && requestError.status === 409) {
        setConflictTerm(term);
        notifyWarning("This term is referenced and cannot be deleted. It can be deactivated instead.");
      } else {
        notifyError(getAdminErrorMessage(requestError));
      }
    } finally {
      setActionId(null);
    }
  }

  async function deactivateConflict() {
    if (!accessToken || !conflictTerm) return;
    setActionId(conflictTerm._id);
    try {
      await adminApi.updateTaxonomyTerm(accessToken, conflictTerm._id, { isActive: false });
      notifySuccess("Referenced taxonomy term deactivated.");
      setConflictTerm(null);
      await Promise.all([loadTerms(), loadParentOptions()]);
    } catch (requestError) {
      notifyError(getAdminErrorMessage(requestError));
    } finally {
      setActionId(null);
    }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery(searchDraft.trim());
  }

  return (
    <>
      <div className="mb-4 rounded-2xl border border-[var(--admin-line)] bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_auto]">
          <form onSubmit={submitSearch} className="flex min-w-0">
            <label className="sr-only" htmlFor="taxonomy-search">Search taxonomy</label>
            <input id="taxonomy-search" value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Search by name" className="h-10 min-w-0 flex-1 rounded-l-lg border border-r-0 border-[var(--admin-line)] px-3 text-sm outline-none focus:border-[var(--admin-gold)]" />
            <button type="submit" aria-label="Search taxonomy" className="inline-flex h-10 w-10 items-center justify-center rounded-r-lg bg-[var(--admin-navy)] text-white"><FiSearch aria-hidden="true" /></button>
          </form>
          <label>
            <span className="sr-only">Filter by taxonomy kind</span>
            <select value={kind} onChange={(event) => setKind(event.target.value)} className="h-10 w-full rounded-lg border border-[var(--admin-line)] bg-white px-3 text-sm font-semibold">
              <option value="">All kinds</option>
              {taxonomyKinds.map((item) => <option key={item} value={item}>{formatLabel(item)}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by parent</span>
            <select value={parent} onChange={(event) => setParent(event.target.value)} className="h-10 w-full rounded-lg border border-[var(--admin-line)] bg-white px-3 text-sm font-semibold">
              <option value="">All parent relationships</option>
              <option value="null">Top-level only</option>
              {parentOptions.map((term) => <option key={term._id} value={term._id}>Children of {term.name}</option>)}
            </select>
          </label>
          <div className="flex gap-2">
            <label>
              <span className="sr-only">Filter by active state</span>
              <select value={active} onChange={(event) => setActive(event.target.value as ActiveFilter)} className="h-10 rounded-lg border border-[var(--admin-line)] bg-white px-3 text-sm font-semibold">
                <option value="">Any status</option><option value="true">Active</option><option value="false">Inactive</option>
              </select>
            </label>
            <button type="button" onClick={() => void Promise.all([loadTerms(), loadParentOptions()])} disabled={isLoading} aria-label="Refresh taxonomy" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--admin-line)] hover:bg-slate-50 disabled:opacity-50"><FiRefreshCw className={isLoading ? "animate-spin" : ""} aria-hidden="true" /></button>
            <button type="button" onClick={() => setEditing("new")} className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-lg bg-[var(--admin-navy)] px-4 text-sm font-bold text-white hover:bg-[var(--admin-navy-soft)]"><FiPlus aria-hidden="true" /> Add term</button>
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--admin-muted)]">Choose one kind and clear the search and status filter to enable Up and Down ordering controls.</p>
      </div>

      {error ? (
        <AdminErrorState message={error} onRetry={() => void loadTerms()} />
      ) : isLoading && !terms.length ? (
        <AdminLoadingState label="Loading taxonomy" />
      ) : terms.length ? (
        <section className="overflow-x-auto rounded-2xl border border-[var(--admin-line)] bg-white">
          <div className="min-w-[940px]">
            <div className="grid grid-cols-[1.15fr_1fr_1fr_0.45fr_0.55fr_1.15fr] gap-4 bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--admin-muted)]"><span>Name</span><span>Kind</span><span>Parent</span><span>Order</span><span>Status</span><span className="text-right">Actions</span></div>
            {terms.map((term, index) => (
              <div key={term._id} className="grid grid-cols-[1.15fr_1fr_1fr_0.45fr_0.55fr_1.15fr] items-center gap-4 border-t border-[var(--admin-line)] px-5 py-4">
                <div className="min-w-0"><p className="truncate text-sm font-bold">{term.name}</p><p className="mt-1 truncate text-xs text-[var(--admin-muted)]">{term.slug}{term.metadata ? " · Metadata configured" : ""}</p></div>
                <span className="text-sm text-[var(--admin-muted)]">{formatLabel(term.kind)}</span>
                <span className="truncate text-sm text-[var(--admin-muted)]">{term.parent ? parentNames.get(term.parent) ?? "Unknown parent" : "Top level"}</span>
                <span className="text-sm font-semibold">{term.order}</span>
                <span className={`text-xs font-bold ${term.isActive ? "text-emerald-700" : "text-slate-500"}`}>{term.isActive ? "Active" : "Inactive"}</span>
                <div className="flex justify-end gap-1.5">
                  <button type="button" onClick={() => void reorderTerm(index, -1)} disabled={!canReorder || index === 0 || actionId === "reorder"} aria-label={`Move ${term.name} up`} title="Move up" className="rounded-lg border border-[var(--admin-line)] p-2 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"><FiChevronUp aria-hidden="true" /></button>
                  <button type="button" onClick={() => void reorderTerm(index, 1)} disabled={!canReorder || index === terms.length - 1 || actionId === "reorder"} aria-label={`Move ${term.name} down`} title="Move down" className="rounded-lg border border-[var(--admin-line)] p-2 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"><FiChevronDown aria-hidden="true" /></button>
                  <button type="button" onClick={() => void toggleActive(term)} disabled={actionId === term._id} className="rounded-lg border border-[var(--admin-line)] px-2.5 py-2 text-xs font-bold hover:bg-slate-50 disabled:opacity-50">{actionId === term._id ? <FiLoader className="animate-spin" aria-label="Updating" /> : term.isActive ? "Deactivate" : "Activate"}</button>
                  <button type="button" onClick={() => void openEditor(term)} disabled={actionId === `detail:${term._id}`} aria-label={`Edit ${term.name}`} className="rounded-lg border border-[var(--admin-line)] p-2 hover:bg-slate-50 disabled:opacity-50">{actionId === `detail:${term._id}` ? <FiLoader className="animate-spin" aria-hidden="true" /> : <FiEdit2 aria-hidden="true" />}</button>
                  <button type="button" onClick={() => setDeleting(term)} aria-label={`Delete ${term.name}`} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><FiTrash2 aria-hidden="true" /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <AdminEmptyState title="No taxonomy terms" description="No terms match the selected filters. Adjust the filters or add a new term." />
      )}

      {editing ? <TaxonomyEditor key={editing === "new" ? "new" : editing._id} item={editing === "new" ? null : editing} parentOptions={parentOptions} accessToken={accessToken} onClose={() => setEditing(null)} onSaved={async () => { setEditing(null); await Promise.all([loadTerms(), loadParentOptions()]); }} /> : null}
      {deleting ? <AdminConfirmationDialog title="Delete taxonomy term?" description={`Delete “${deleting.name}”? Referenced terms cannot be deleted and will need to be deactivated instead.`} confirmLabel="Delete" tone="danger" isLoading={actionId === deleting._id} onCancel={() => setDeleting(null)} onConfirm={() => void deleteTerm()} /> : null}
      {conflictTerm ? <AdminConfirmationDialog title="Term is in use" description={`“${conflictTerm.name}” is referenced by other records, so deleting it would break those relationships. Deactivate it to hide it from new selections while preserving existing data.`} confirmLabel="Deactivate" isLoading={actionId === conflictTerm._id} onCancel={() => setConflictTerm(null)} onConfirm={() => void deactivateConflict()} /> : null}
    </>
  );
}

function TaxonomyEditor({ item, parentOptions, accessToken, onClose, onSaved }: { item: AdminTaxonomyTerm | null; parentOptions: AdminTaxonomyTerm[]; accessToken: string | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const isKnownKind = item ? taxonomyKinds.includes(item.kind as (typeof taxonomyKinds)[number]) : true;
  const [kindChoice, setKindChoice] = useState(item ? (isKnownKind ? item.kind : "CUSTOM") : "BRAND");
  const [customKind, setCustomKind] = useState(item && !isKnownKind ? item.kind : "");
  const [name, setName] = useState(item?.name ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [parent, setParent] = useState(item?.parent ?? "");
  const [order, setOrder] = useState(String(item?.order ?? 0));
  const [metadata, setMetadata] = useState(item?.metadata ? JSON.stringify(item.metadata, null, 2) : "");
  const [isActive, setIsActive] = useState(item?.isActive ?? true);
  const [fieldError, setFieldError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError("");
    const selectedKind = kindChoice === "CUSTOM" ? customKind.trim().toUpperCase().replaceAll(" ", "_") : kindChoice;
    if (!selectedKind) return setFieldError("Choose or enter a taxonomy kind.");
    if (!name.trim()) return setFieldError("Enter a term name.");
    const parsedOrder = Number(order);
    if (!Number.isFinite(parsedOrder)) return setFieldError("Order must be a valid number.");
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
    const payload: AdminTaxonomyPayload = {
      kind: selectedKind,
      name: name.trim(),
      slug: slug.trim() || undefined,
      parent: parent || null,
      order: parsedOrder,
      metadata: parsedMetadata,
      isActive,
    };
    setIsSaving(true);
    try {
      if (item) {
        const { kind: _kind, ...updates } = payload;
        void _kind;
        await adminApi.updateTaxonomyTerm(accessToken, item._id, updates);
      } else {
        await adminApi.createTaxonomyTerm(accessToken, payload);
      }
      notifySuccess(item ? "Taxonomy term updated." : "Taxonomy term created.");
      await onSaved();
    } catch (requestError) {
      notifyError(getAdminErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50"><button type="button" aria-label="Close editor" className="absolute inset-0 bg-slate-950/55" onClick={onClose} /><aside role="dialog" aria-modal="true" aria-labelledby="taxonomy-editor-title" className="absolute inset-y-0 right-0 w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-[var(--admin-line)] px-6 py-5"><h2 id="taxonomy-editor-title" className="font-display text-xl font-bold">{item ? "Edit taxonomy term" : "Add taxonomy term"}</h2><button type="button" onClick={onClose} aria-label="Close editor" className="rounded-lg p-2 hover:bg-slate-100"><FiX aria-hidden="true" /></button></div>
      <form onSubmit={submit} className="space-y-5 p-6">
        <label className="block text-sm font-semibold">Kind<select value={kindChoice} disabled={Boolean(item)} onChange={(event) => setKindChoice(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[var(--admin-line)] bg-white px-3 disabled:bg-slate-100">{taxonomyKinds.map((option) => <option key={option} value={option}>{formatLabel(option)}</option>)}<option value="CUSTOM">Other kind</option></select></label>
        {kindChoice === "CUSTOM" ? <label className="block text-sm font-semibold">Custom kind<input value={customKind} disabled={Boolean(item)} onChange={(event) => setCustomKind(event.target.value)} placeholder="e.g. TRANSMISSION_TYPE" className="mt-2 h-11 w-full rounded-lg border border-[var(--admin-line)] px-3 uppercase disabled:bg-slate-100" /></label> : null}
        <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold">Name<input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[var(--admin-line)] px-3 outline-none focus:border-[var(--admin-gold)]" /></label><label className="block text-sm font-semibold">Slug <span className="font-normal text-[var(--admin-muted)]">(optional)</span><input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="Generated when blank" className="mt-2 h-11 w-full rounded-lg border border-[var(--admin-line)] px-3 outline-none focus:border-[var(--admin-gold)]" /></label></div>
        <label className="block text-sm font-semibold">Parent term<select value={parent} onChange={(event) => setParent(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[var(--admin-line)] bg-white px-3"><option value="">No parent (top level)</option>{parentOptions.filter((option) => option._id !== item?._id).map((option) => <option key={option._id} value={option._id}>{option.name} / {formatLabel(option.kind)}</option>)}</select></label>
        <label className="block text-sm font-semibold">Order<input type="number" value={order} onChange={(event) => setOrder(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[var(--admin-line)] px-3 outline-none focus:border-[var(--admin-gold)]" /></label>
        <label className="block text-sm font-semibold">Metadata JSON <span className="font-normal text-[var(--admin-muted)]">(object only)</span><textarea value={metadata} onChange={(event) => setMetadata(event.target.value)} className="mt-2 min-h-36 w-full rounded-lg border border-[var(--admin-line)] p-3 font-mono text-sm outline-none focus:border-[var(--admin-gold)]" placeholder={JSON.stringify({ key: "value" })} /></label>
        <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-4 w-4" /> Active</label>
        {fieldError ? <p role="alert" className="text-sm text-red-700">{fieldError}</p> : null}
        <div className="flex justify-end gap-3 border-t border-[var(--admin-line)] pt-5"><button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600">Cancel</button><button type="submit" disabled={isSaving} className="inline-flex min-w-28 items-center justify-center gap-2 rounded-lg bg-[var(--admin-navy)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{isSaving ? <FiLoader className="animate-spin" aria-hidden="true" /> : null}{item ? "Save changes" : "Create term"}</button></div>
      </form>
    </aside></div>
  );
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}
