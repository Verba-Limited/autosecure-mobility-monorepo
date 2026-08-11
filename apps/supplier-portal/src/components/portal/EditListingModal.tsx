"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import type { PortalListingRow } from "@/lib/supplier-listing-mappers";
import { supplierPortalApi } from "@/lib/supplier-api";

interface EditListingModalProps {
  listing: PortalListingRow | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updatedListing: PortalListingRow) => void;
}

function EditListingForm({
  listing,
  onClose,
  onSaved,
}: {
  listing: PortalListingRow;
  onClose: () => void;
  onSaved: (updatedListing: PortalListingRow) => void;
}) {
  const [name, setName] = useState(listing.name || "");
  const [category, setCategory] = useState<PortalListingRow["category"]>(
    listing.category || "NEW CAR",
  );
  const [price, setPrice] = useState(listing.price || "");
  const [status, setStatus] = useState<PortalListingRow["status"]>(
    listing.status || "Active",
  );
  const [condition, setCondition] = useState(
    listing.condition || (listing.category === "NEW CAR" ? "Brand New" : "Used"),
  );
  const [description, setDescription] = useState(listing.description || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const updatePayload = {
      title: name,
      name,
      category,
      price: price.replace(/[^0-9.]/g, ""),
      displayPrice: price,
      status,
      condition,
      description,
    };

    try {
      await supplierPortalApi.updateListing(listing.id, updatePayload);
      onSaved({
        ...listing,
        name,
        category,
        price,
        status,
        condition,
        description,
      });
      onClose();
    } catch {
      onSaved({
        ...listing,
        name,
        category,
        price,
        status,
        condition,
        description,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all sm:p-7">
        <div className="flex items-center justify-between border-b border-portal-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-portal-ink">Edit Listing</h2>
            <p className="text-xs text-slate-500">Update vehicle or part details</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-portal-ink">
              Title / Item Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-portal-ink">
                Category
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as PortalListingRow["category"])
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15"
              >
                <option value="NEW CAR">NEW CAR</option>
                <option value="USED CAR">USED CAR</option>
                <option value="PART">PART</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-portal-ink">
                Price
              </label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. $45,000"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-portal-ink">
                Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as PortalListingRow["status"])
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-portal-ink">
                Condition
              </label>
              <input
                type="text"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="e.g. Brand New, Used, Refurbished"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-portal-ink">
              Description / Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add optional notes or listing details..."
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15"
            />
          </div>

          <div className="mt-4 flex items-center justify-end gap-3 border-t border-portal-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-portal-blue-600 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-portal-blue-700 disabled:opacity-50"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditListingModal({
  listing,
  isOpen,
  onClose,
  onSaved,
}: EditListingModalProps) {
  if (!isOpen || !listing) return null;

  return (
    <EditListingForm
      key={listing.id}
      listing={listing}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}
