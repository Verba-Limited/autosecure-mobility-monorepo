"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { FiLoader, FiPlus, FiRefreshCw, FiSearch } from "react-icons/fi";
import type { AdminListing, AdminListingsQuery, PaginationMeta } from "@autosecure/api";
import { AdminConfirmationDialog, AdminEmptyState, AdminErrorState, AdminLoadingState, AdminPageHeader } from "@/components/ui/AdminPrimitives";
import { adminApi, getAdminErrorMessage } from "@/lib/admin-api";
import { notifyError, notifySuccess } from "@/lib/admin-notifications";
import { useAdminAuthStore } from "@/stores/auth-store";
import { ListingWorkspace, RejectDialog, VerifyListingDialog } from "@/components/routes/listings/ListingWorkspace";

type BoolFilter = "" | "true" | "false";
const emptyMeta: PaginationMeta = { totalItems: 0, itemCount: 0, itemsPerPage: 10, totalPages: 1, currentPage: 1 };

export function ListingsRoute({ initialStatus = "", initialQuery = "" }: { initialStatus?: string; initialQuery?: string }) {
  const accessToken = useAdminAuthStore((state) => state.accessToken);
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [meta, setMeta] = useState(emptyMeta);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(initialStatus);
  const [type, setType] = useState("");
  const [house, setHouse] = useState<BoolFilter>("");
  const [unverified, setUnverified] = useState<BoolFilter>("");
  const [hotDeal, setHotDeal] = useState<BoolFilter>("");
  const [supplier, setSupplier] = useState("");
  const [searchDraft, setSearchDraft] = useState(initialQuery);
  const [search, setSearch] = useState(initialQuery);
  const [selected, setSelected] = useState<AdminListing | null>(null);
  const [mode, setMode] = useState<"view" | "edit" | "create" | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [confirm, setConfirm] = useState<"approve" | "archive" | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const query = useMemo<AdminListingsQuery>(() => ({ page, limit: 10, q: search || undefined, status: status || undefined, type: type || undefined, supplier: supplier.trim() || undefined, hasUnverified: unverified ? unverified === "true" : undefined, isHouseListing: house ? house === "true" : undefined, hotDeal: hotDeal ? hotDeal === "true" : undefined }), [hotDeal, house, page, search, status, supplier, type, unverified]);
  const load = useCallback(async () => { if (!accessToken) return; setLoading(true); setError(""); try { const response = await adminApi.getListings(accessToken, query); setListings(response.data.items); setMeta(response.data.meta); } catch (requestError) { setError(getAdminErrorMessage(requestError)); } finally { setLoading(false); } }, [accessToken, query]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  function submitSearch(event: FormEvent) { event.preventDefault(); setPage(1); setSearch(searchDraft.trim()); }
  async function openListing(listing: AdminListing) { if (!accessToken) return; setActionKey(`detail:${listing._id}`); try { const response = await adminApi.getListing(accessToken, listing._id); setSelected(response.data); setMode("view"); } catch (requestError) { notifyError(getAdminErrorMessage(requestError)); } finally { setActionKey(null); } }
  async function approve() { if (!accessToken || !selected) return; setActionKey("approve"); try { const response = await adminApi.approveListing(accessToken, selected._id); setSelected(response.data); setConfirm(null); notifySuccess("Listing approved and published."); await load(); } catch (requestError) { notifyError(getAdminErrorMessage(requestError)); } finally { setActionKey(null); } }
  async function archive() { if (!accessToken || !selected) return; setActionKey("archive"); try { const response = await adminApi.deleteListing(accessToken, selected._id); setSelected(response.data.listing); setConfirm(null); notifySuccess("Listing archived."); await load(); } catch (requestError) { notifyError(getAdminErrorMessage(requestError)); } finally { setActionKey(null); } }
  return <>
    <AdminPageHeader title="Listings" description="Review supplier submissions and manage AutoSecure-owned marketplace listings." actions={<button type="button" onClick={() => { setSelected(null); setMode("create"); }} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--admin-navy)] px-4 text-sm font-bold text-white"><FiPlus /> Add AutoSecure listing</button>} />
    <section className="mb-5 rounded-2xl border border-[var(--admin-line)] bg-white p-4"><div className="grid min-w-0 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <form onSubmit={submitSearch} className="flex min-w-0 md:col-span-2"><input aria-label="Search listings" value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Search listings" className="h-10 min-w-0 flex-1 rounded-l-lg border border-r-0 px-3 text-sm" /><button aria-label="Search" className="h-10 w-10 shrink-0 rounded-r-lg bg-[var(--admin-navy)] text-white"><FiSearch className="mx-auto" /></button></form>
      <Filter value={status} setValue={(value) => { setPage(1); setStatus(value); }} all="Any status" options={[["DRAFT", "Draft"], ["PENDING_REVIEW", "Pending review"], ["APPROVED", "Approved"], ["REJECTED", "Rejected"], ["ARCHIVED", "Archived"]]} />
      <Filter value={type} setValue={(value) => { setPage(1); setType(value); }} all="Any type" options={[["BRAND_NEW_CAR", "Brand-new car"], ["USED_CAR", "Used car"], ["PART", "Part"]]} />
      <Filter value={house} setValue={(value) => { setPage(1); setHouse(value as BoolFilter); }} all="Any owner" options={[["true", "AutoSecure"], ["false", "Supplier"]]} />
      <Filter value={unverified} setValue={(value) => { setPage(1); setUnverified(value as BoolFilter); }} all="Any verification" options={[["true", "Needs verification"], ["false", "Verified"]]} />
      <Filter value={hotDeal} setValue={(value) => { setPage(1); setHotDeal(value as BoolFilter); }} all="Any promotion" options={[["true", "Hot Deal"], ["false", "Not Hot Deal"]]} />
      <input value={supplier} onChange={(event) => { setPage(1); setSupplier(event.target.value); }} aria-label="Supplier ID filter" placeholder="Supplier ID" className="h-10 min-w-0 w-full rounded-lg border px-3 text-sm" />
      <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border px-3 text-sm font-bold"><FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh</button>
    </div></section>
    {error ? <AdminErrorState message={error} onRetry={() => void load()} /> : loading && !listings.length ? <AdminLoadingState label="Loading listings" /> : listings.length ? <><section className="overflow-x-auto rounded-2xl border border-[var(--admin-line)] bg-white"><div className="min-w-[900px]"><div className="grid grid-cols-[1.5fr_0.9fr_0.8fr_0.8fr_0.9fr_0.6fr] gap-4 bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--admin-muted)]"><span>Listing</span><span>Supplier</span><span>Type</span><span>Status</span><span>Verification</span><span /></div>{listings.map((listing) => <div key={listing._id} className="grid grid-cols-[1.5fr_0.9fr_0.8fr_0.8fr_0.9fr_0.6fr] items-center gap-4 border-t px-5 py-4"><div className="min-w-0"><p className="truncate text-sm font-bold">{listing.title}</p><p className="mt-1 truncate text-xs text-[var(--admin-muted)]">{listing.brand} {listing.model} {listing.year}</p></div><span className="truncate text-sm text-[var(--admin-muted)]">{listing.isHouseListing ? "AutoSecure" : listing.supplier?.companyName ?? listing.supplier?.email ?? "Supplier"}</span><span className="text-xs font-semibold">{format(listing.type)}</span><span className="text-xs font-bold">{format(listing.status)}</span><span className="text-xs text-[var(--admin-muted)]">{listing.unverifiedSections?.length ? `${listing.unverifiedSections.length} pending` : "Verified"}</span><button type="button" onClick={() => void openListing(listing)} className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold">{actionKey === `detail:${listing._id}` ? <FiLoader className="animate-spin" /> : null} Manage</button></div>)}</div></section><Pagination meta={meta} onPage={setPage} /></> : <AdminEmptyState title="No listings found" description="No listings match these filters." />}
    {mode ? <ListingWorkspace mode={mode} listing={selected} accessToken={accessToken} onClose={() => { setMode(null); setSelected(null); }} onEdit={() => setMode("edit")} onSaved={async (listing) => { setSelected(listing); setMode("view"); await load(); }} onApprove={() => setConfirm("approve")} onReject={() => setRejectOpen(true)} onVerify={() => setVerifyOpen(true)} onArchive={() => setConfirm("archive")} /> : null}
    {selected && rejectOpen ? <RejectDialog listing={selected} accessToken={accessToken} onClose={() => setRejectOpen(false)} onSaved={async (listing) => { setSelected(listing); setRejectOpen(false); await load(); }} /> : null}
    {selected && verifyOpen ? <VerifyListingDialog listing={selected} accessToken={accessToken} onClose={() => setVerifyOpen(false)} onSaved={async (listing) => { setSelected(listing); setVerifyOpen(false); await load(); }} /> : null}
    {selected && confirm ? <AdminConfirmationDialog title={confirm === "approve" ? "Approve this listing?" : "Archive this listing?"} description={confirm === "approve" ? "The listing will be approved for publication. This is blocked while AI-generated sections remain unverified." : "The listing will be soft-archived and removed from active marketplace workflows."} confirmLabel={confirm === "approve" ? "Approve" : "Archive"} isLoading={actionKey === confirm} onCancel={() => setConfirm(null)} onConfirm={() => void (confirm === "approve" ? approve() : archive())} /> : null}
  </>;
}

function Filter({ value, setValue, all, options }: { value: string; setValue: (value: string) => void; all: string; options: string[][] }) { return <select value={value} onChange={(event) => setValue(event.target.value)} className="h-10 min-w-0 w-full rounded-lg border bg-white px-3 text-sm font-semibold"><option value="">{all}</option>{options.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>; }
function Pagination({ meta, onPage }: { meta: PaginationMeta; onPage: (page: number) => void }) { return <div className="mt-4 flex justify-between text-sm text-[var(--admin-muted)]"><span>{meta.totalItems} listings · Page {meta.currentPage} of {Math.max(meta.totalPages, 1)}</span><div className="flex gap-2"><button disabled={meta.currentPage <= 1} onClick={() => onPage(meta.currentPage - 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Previous</button><button disabled={meta.currentPage >= meta.totalPages} onClick={() => onPage(meta.currentPage + 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Next</button></div></div>; }
function format(value: string) { return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()); }
