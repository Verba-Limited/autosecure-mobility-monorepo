"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { FiLoader, FiPlus, FiRefreshCw, FiSearch } from "react-icons/fi";
import { ApiError, type AdminAttribute, type AdminTaxonomyTerm, type AdminTrim, type AdminTrimsQuery, type PaginationMeta } from "@autosecure/api";
import { AdminConfirmationDialog, AdminEmptyState, AdminErrorState, AdminLoadingState, AdminPageHeader } from "@/components/ui/AdminPrimitives";
import { adminApi, getAdminErrorMessage } from "@/lib/admin-api";
import { notifyError, notifySuccess, notifyWarning } from "@/lib/admin-notifications";
import { useAdminAuthStore } from "@/stores/auth-store";
import { DuplicateDialog, TrimWorkspace, VerifyDialog, type ConfirmAction } from "@/components/routes/trims/TrimWorkspace";

type BooleanFilter = "" | "true" | "false";
const emptyMeta: PaginationMeta = { totalItems: 0, itemCount: 0, itemsPerPage: 10, totalPages: 1, currentPage: 1 };

export function TrimsRoute() {
  const accessToken = useAdminAuthStore((state) => state.accessToken);
  const [trims, setTrims] = useState<AdminTrim[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(emptyMeta);
  const [taxonomy, setTaxonomy] = useState<AdminTaxonomyTerm[]>([]);
  const [attributes, setAttributes] = useState<AdminAttribute[]>([]);
  const [referenceError, setReferenceError] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [brandSlug, setBrandSlug] = useState("");
  const [modelSlug, setModelSlug] = useState("");
  const [year, setYear] = useState("");
  const [unverified, setUnverified] = useState<BooleanFilter>("");
  const [searchDraft, setSearchDraft] = useState("");
  const [queryText, setQueryText] = useState("");
  const [selected, setSelected] = useState<AdminTrim | null>(null);
  const [mode, setMode] = useState<"view" | "edit" | "create" | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  const query = useMemo<AdminTrimsQuery>(() => ({ page, limit: 10, status: status || undefined, brandSlug: brandSlug || undefined, modelSlug: modelSlug || undefined, year: year || undefined, hasUnverified: unverified ? unverified === "true" : undefined, q: queryText || undefined }), [brandSlug, modelSlug, page, queryText, status, unverified, year]);
  const loadTrims = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true); setError("");
    try { const response = await adminApi.getTrims(accessToken, query); setTrims(response.data.items); setMeta(response.data.meta); }
    catch (requestError) { setError(getAdminErrorMessage(requestError)); }
    finally { setIsLoading(false); }
  }, [accessToken, query]);
  const loadReferences = useCallback(async () => {
    if (!accessToken) return;
    setReferenceError("");
    try { const [terms, fields] = await Promise.all([adminApi.getTaxonomy(accessToken, { isActive: true }), adminApi.getAttributes(accessToken, { scope: "VEHICLE" })]); setTaxonomy(terms.data); setAttributes(fields.data.filter((item) => item.isActive)); }
    catch (requestError) { setReferenceError(getAdminErrorMessage(requestError)); }
  }, [accessToken]);
  useEffect(() => { const timer = window.setTimeout(() => void loadTrims(), 0); return () => window.clearTimeout(timer); }, [loadTrims]);
  useEffect(() => { const timer = window.setTimeout(() => void loadReferences(), 0); return () => window.clearTimeout(timer); }, [loadReferences]);

  const brands = taxonomy.filter((term) => term.kind === "BRAND");
  const brandId = brands.find((term) => term.slug === brandSlug)?._id;
  const models = taxonomy.filter((term) => term.kind === "MODEL" && (!brandId || term.parent === brandId));
  function submitSearch(event: FormEvent) { event.preventDefault(); setPage(1); setQueryText(searchDraft.trim()); }
  async function openTrim(trim: AdminTrim) { if (!accessToken) return; setActionKey(`detail:${trim._id}`); try { const response = await adminApi.getTrim(accessToken, trim._id); setSelected(response.data); setMode("view"); } catch (requestError) { notifyError(getAdminErrorMessage(requestError)); } finally { setActionKey(null); } }
  async function runLifecycle(action: "publish" | "unpublish" | "archive") { if (!accessToken || !selected) return; setActionKey(action); try { const response = action === "publish" ? await adminApi.publishTrim(accessToken, selected._id) : action === "unpublish" ? await adminApi.unpublishTrim(accessToken, selected._id) : await adminApi.archiveTrim(accessToken, selected._id); setSelected(response.data); notifySuccess(action === "publish" ? "Trim published." : action === "unpublish" ? "Trim returned to draft." : "Trim archived."); setConfirmAction(null); await loadTrims(); } catch (requestError) { notifyError(getAdminErrorMessage(requestError)); } finally { setActionKey(null); } }
  async function deleteSelected() { if (!accessToken || !selected) return; setActionKey("delete"); try { await adminApi.deleteTrim(accessToken, selected._id); notifySuccess("Trim deleted."); setConfirmAction(null); setMode(null); setSelected(null); await loadTrims(); } catch (requestError) { if (requestError instanceof ApiError && requestError.status === 409) { setConfirmAction("archive"); notifyWarning("This trim is referenced and cannot be deleted. Archive it instead."); } else notifyError(getAdminErrorMessage(requestError)); } finally { setActionKey(null); } }
  async function uploadImages(event: ChangeEvent<HTMLInputElement>) { if (!accessToken || !selected) return; const files = Array.from(event.target.files ?? []); event.target.value = ""; if (!files.length) return; if (files.length > 10) return notifyError("Upload no more than 10 images at once."); if ((selected.images?.length ?? 0) + files.length > 20) return notifyError("A trim can contain no more than 20 images."); const invalid = files.find((file) => !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024); if (invalid) return notifyError(`${invalid.name} must be an image no larger than 5 MB.`); setActionKey("images"); try { const response = await adminApi.uploadTrimImages(accessToken, selected._id, files); setSelected(response.data); notifySuccess(`${files.length} image${files.length === 1 ? "" : "s"} uploaded.`); await loadTrims(); } catch (requestError) { notifyError(getAdminErrorMessage(requestError)); } finally { setActionKey(null); } }

  return <>
    <AdminPageHeader title="Vehicle trims" description="Maintain reusable vehicle specifications and control their verification and publication lifecycle." actions={<button type="button" onClick={() => { setSelected(null); setMode("create"); }} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--admin-navy)] px-4 text-sm font-bold text-white"><FiPlus /> Add trim</button>} />
    {referenceError ? <div className="mb-5"><AdminErrorState message={`Classification and attribute fields could not load: ${referenceError}`} onRetry={() => void loadReferences()} /></div> : null}
    <section className="mb-5 rounded-2xl border border-[var(--admin-line)] bg-white p-4"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.3fr_0.9fr_0.9fr_0.65fr_0.8fr_0.8fr_auto]">
      <form onSubmit={submitSearch} className="flex"><input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} aria-label="Search trims" placeholder="Search trim, brand, model, or slug" className="h-10 min-w-0 flex-1 rounded-l-lg border border-r-0 border-[var(--admin-line)] px-3 text-sm" /><button type="submit" aria-label="Search" className="inline-flex h-10 w-10 items-center justify-center rounded-r-lg bg-[var(--admin-navy)] text-white"><FiSearch /></button></form>
      <Filter value={brandSlug} onChange={(value) => { setPage(1); setBrandSlug(value); setModelSlug(""); }} all="All brands" options={brands.map((term) => [term.slug, term.name])} />
      <Filter value={modelSlug} onChange={(value) => { setPage(1); setModelSlug(value); }} all="All models" options={models.map((term) => [term.slug, term.name])} />
      <input value={year} onChange={(event) => { setPage(1); setYear(event.target.value); }} type="number" aria-label="Filter by year" placeholder="Year" className="h-10 rounded-lg border border-[var(--admin-line)] px-3 text-sm" />
      <Filter value={status} onChange={(value) => { setPage(1); setStatus(value); }} all="Any status" options={[["DRAFT", "Draft"], ["PUBLISHED", "Published"], ["ARCHIVED", "Archived"]]} />
      <Filter value={unverified} onChange={(value) => { setPage(1); setUnverified(value as BooleanFilter); }} all="Any verification" options={[["true", "Needs verification"], ["false", "Fully verified"]]} />
      <button type="button" onClick={() => void loadTrims()} disabled={isLoading} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--admin-line)] px-3 text-sm font-bold"><FiRefreshCw className={isLoading ? "animate-spin" : ""} /> Refresh</button>
    </div></section>
    {error ? <AdminErrorState message={error} onRetry={() => void loadTrims()} /> : isLoading && !trims.length ? <AdminLoadingState label="Loading trims" /> : trims.length ? <><section className="overflow-x-auto rounded-2xl border border-[var(--admin-line)] bg-white"><div className="min-w-[900px]"><div className="grid grid-cols-[1.4fr_1fr_0.6fr_0.7fr_0.8fr_0.6fr] gap-4 bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--admin-muted)]"><span>Trim</span><span>Classification</span><span>Year</span><span>Status</span><span>Verification</span><span /></div>{trims.map((trim) => <div key={trim._id} className="grid grid-cols-[1.4fr_1fr_0.6fr_0.7fr_0.8fr_0.6fr] items-center gap-4 border-t border-[var(--admin-line)] px-5 py-4"><div className="min-w-0"><p className="truncate text-sm font-bold">{trim.name}</p><p className="mt-1 truncate text-xs text-[var(--admin-muted)]">{trim.brandName ?? trim.brandSlug} / {trim.modelName ?? trim.modelSlug}</p></div><span className="text-sm text-[var(--admin-muted)]">{[trim.bodyType, trim.powertrain].filter(Boolean).join(" / ") || "Not set"}</span><span className="text-sm font-semibold">{trim.year}{trim.yearTo ? `–${trim.yearTo}` : ""}</span><span className="text-xs font-bold">{trim.status ?? "DRAFT"}</span><span className="text-xs text-[var(--admin-muted)]">{trim.unverifiedSections?.length ? `${trim.unverifiedSections.length} pending` : "Verified"}</span><button type="button" onClick={() => void openTrim(trim)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--admin-line)] px-3 py-2 text-xs font-bold">{actionKey === `detail:${trim._id}` ? <FiLoader className="animate-spin" /> : null} Manage</button></div>)}</div></section><Pagination meta={meta} onPage={setPage} /></> : <AdminEmptyState title="No trims found" description="No vehicle trims match the selected filters." />}
    {mode ? <TrimWorkspace mode={mode} trim={selected} taxonomy={taxonomy} attributes={attributes} accessToken={accessToken} actionKey={actionKey} onClose={() => { setMode(null); setSelected(null); }} onEdit={() => setMode("edit")} onSaved={async (trim) => { setSelected(trim); setMode("view"); await loadTrims(); }} onConfirm={setConfirmAction} onVerify={() => setVerifyOpen(true)} onDuplicate={() => setDuplicateOpen(true)} onUpload={uploadImages} /> : null}
    {selected && verifyOpen ? <VerifyDialog trim={selected} accessToken={accessToken} onClose={() => setVerifyOpen(false)} onSaved={async (trim) => { setSelected(trim); setVerifyOpen(false); notifySuccess("Trim sections verified."); await loadTrims(); }} /> : null}
    {selected && duplicateOpen ? <DuplicateDialog trim={selected} accessToken={accessToken} onClose={() => setDuplicateOpen(false)} onSaved={async () => { setDuplicateOpen(false); await loadTrims(); }} /> : null}
    {selected && confirmAction ? <AdminConfirmationDialog title={confirmTitle(confirmAction)} description={confirmDescription(confirmAction, selected)} confirmLabel={confirmAction === "delete" ? "Delete" : confirmAction === "archive" ? "Archive" : confirmAction === "publish" ? "Publish" : "Return to draft"} tone={confirmAction === "delete" ? "danger" : "default"} isLoading={actionKey === confirmAction} onCancel={() => setConfirmAction(null)} onConfirm={() => void (confirmAction === "delete" ? deleteSelected() : runLifecycle(confirmAction))} /> : null}
  </>;
}

function Filter({ value, onChange, options, all }: { value: string; onChange: (value: string) => void; options: string[][]; all: string }) { return <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-lg border border-[var(--admin-line)] bg-white px-3 text-sm font-semibold"><option value="">{all}</option>{options.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>; }
function Pagination({ meta, onPage }: { meta: PaginationMeta; onPage: (page: number) => void }) { return <div className="mt-4 flex items-center justify-between text-sm text-[var(--admin-muted)]"><span>{meta.totalItems} trims · Page {meta.currentPage} of {Math.max(meta.totalPages, 1)}</span><div className="flex gap-2"><button disabled={meta.currentPage <= 1} onClick={() => onPage(meta.currentPage - 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Previous</button><button disabled={meta.currentPage >= meta.totalPages} onClick={() => onPage(meta.currentPage + 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Next</button></div></div>; }
function confirmTitle(action: Exclude<ConfirmAction, null>) { return action === "publish" ? "Publish this trim?" : action === "unpublish" ? "Return trim to draft?" : action === "archive" ? "Archive this trim?" : "Delete this trim?"; }
function confirmDescription(action: Exclude<ConfirmAction, null>, trim: AdminTrim) { if (action === "publish") return `${trim.name} will become available to published catalog workflows.`; if (action === "unpublish") return `${trim.name} will return to draft.`; if (action === "archive") return `${trim.name} will be retained but removed from active use.`; return `Delete ${trim.name}? Referenced trims must be archived instead.`; }
