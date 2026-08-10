"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, ArrowLeft, Send } from "lucide-react";
import { supplierPortalApi } from "@/lib/supplier-api";
import {
  getApiItems,
  mapListingRow,
  type PortalListingRow,
} from "@/lib/supplier-listing-mappers";

type SubmitState = "idle" | "loading" | "submitting" | "success" | "error";

const STATUS_STYLES = {
  Active: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Archived: "bg-slate-100 text-slate-600",
};

const CATEGORY_STYLES = {
  "NEW CAR": "bg-portal-blue-600/10 text-portal-blue-600",
  "USED CAR": "bg-brand-green-500/10 text-emerald-700",
  PART: "bg-gold-100 text-gold-600",
};

export function SubmitListingClient({ id }: { id: string }) {
  const router = useRouter();
  const [listing, setListing] = useState<PortalListingRow | null>(null);
  const [state, setState] = useState<SubmitState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadListing() {
      try {
        // Fetch the supplier's listings and find the one matching this id
        const payload = await supplierPortalApi.getListings(1, 100);
        const items = getApiItems(payload);
        const found = items
          .map(mapListingRow)
          .find(
            (row): row is PortalListingRow => row !== null && row.id === id,
          );

        if (isMounted) {
          setListing(found ?? null);
          setState("idle");
        }
      } catch {
        if (isMounted) {
          setState("idle");
        }
      }
    }

    loadListing();

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleSubmit() {
    setErrorMessage(null);
    setState("submitting");

    try {
      await supplierPortalApi.submitListing(id);
      setState("success");
      // Redirect to listings after short delay
      setTimeout(() => {
        router.push("/my-listings");
      }, 2000);
    } catch (err: unknown) {
      const errorObj = err as {
        payload?: { message?: unknown };
        message?: unknown;
      };
      const msg = errorObj.payload?.message
        ? Array.isArray(errorObj.payload.message)
          ? errorObj.payload.message.join(", ")
          : String(errorObj.payload.message)
        : typeof errorObj.message === "string"
          ? errorObj.message
          : "Failed to submit listing. Please try again.";
      setErrorMessage(msg);
      setState("error");
    }
  }

  const isSubmitting = state === "submitting";
  const isSuccess = state === "success";

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back link */}
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-portal-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Listings
      </button>

      <div className="rounded-2xl border border-portal-border bg-white p-8 shadow-sm">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-portal-ink">
            Submit for Approval
          </h1>
          <p className="mt-1.5 text-sm text-[#64748B]">
            Review your listing details below and submit it for admin review.
            Once approved, it will appear live on the marketplace.
          </p>
        </div>

        {/* Success State */}
        {isSuccess && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="font-bold text-emerald-800">
                Submitted successfully!
              </p>
              <p className="mt-0.5 text-sm text-emerald-700">
                Your listing has been sent for admin review. You will be
                notified once it is approved. Redirecting to your listings…
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {state === "error" && errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="font-bold text-red-800">Submission failed</p>
              <p className="mt-0.5 text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Listing Preview */}
        <div className="mb-8 rounded-xl border border-portal-border bg-slate-50 p-6">
          <p className="mb-4 text-xs font-black uppercase tracking-wide text-slate-400">
            Listing Summary
          </p>

          {state === "loading" ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-5 animate-pulse rounded-md bg-slate-200"
                />
              ))}
            </div>
          ) : listing ? (
            <dl className="grid grid-cols-1 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold text-slate-400">Title</dt>
                <dd className="mt-0.5 font-black text-portal-ink">
                  {listing.name}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-400">
                  Category
                </dt>
                <dd className="mt-0.5">
                  <span
                    className={`inline-block rounded-md px-2.5 py-1 text-xs font-black ${CATEGORY_STYLES[listing.category]}`}
                  >
                    {listing.category}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-400">Price</dt>
                <dd className="mt-0.5 font-black text-portal-ink">
                  {listing.price}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-400">
                  Current Status
                </dt>
                <dd className="mt-0.5">
                  <span
                    className={`inline-block rounded-md px-2.5 py-1 text-xs font-black ${STATUS_STYLES[listing.status]}`}
                  >
                    {listing.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-400">Views</dt>
                <dd className="mt-0.5 font-semibold text-portal-ink">
                  {listing.views}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-400">
                  Listing ID
                </dt>
                <dd className="mt-0.5 font-mono text-xs text-slate-500">
                  {id}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-slate-500">
              Listing details could not be loaded. You can still submit using
              the ID: <span className="font-mono font-semibold">{id}</span>
            </p>
          )}
        </div>

        {/* What happens next */}
        <div className="mb-8 rounded-xl border border-portal-blue-600/20 bg-portal-blue-600/5 p-5">
          <p className="mb-2 text-sm font-bold text-portal-blue-600">
            What happens after submission?
          </p>
          <ol className="space-y-1.5 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-portal-blue-600 text-[10px] font-black text-white">
                1
              </span>
              Our team reviews your listing for accuracy and compliance.
            </li>
            {/* <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-portal-blue-600 text-[10px] font-black text-white">
                2
              </span>
              You will be notified via email once it is approved or if changes
              are needed.
            </li> */}
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-portal-blue-600 text-[10px] font-black text-white">
                2
              </span>
              Approved listings go live on the autoSecure marketplace
              immediately.
            </li>
          </ol>
        </div>

        {/* Actions */}
        {!isSuccess && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              id="submit-listing-btn"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-portal-blue-600 px-6 text-sm font-bold text-white transition-colors hover:bg-portal-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Submitting…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit for Approval
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/my-listings")}
              disabled={isSubmitting}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 px-6 text-sm font-bold text-portal-ink transition-colors hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
