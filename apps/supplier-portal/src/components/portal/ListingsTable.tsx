import Link from "next/link";

import { Fragment, useState } from "react";
import { Eye, ChevronUp } from "lucide-react";

export interface Listing {
  id?: string;
  name: string;
  emoji: string;
  image?: string;
  type: "NEW CAR" | "USED CAR" | "PART";
  price: string;
  views: number;
  status: "Active" | "Pending" | "Archived";
  rawItem?: unknown;
}

const TYPE_STYLES: Record<Listing["type"], string> = {
  "NEW CAR": "bg-portal-blue-600/10 text-portal-blue-600",
  "USED CAR": "bg-brand-green-500/10 text-brand-green-600",
  PART: "bg-gold-100 text-gold-600",
};

const STATUS_STYLES: Record<Listing["status"], string> = {
  Active: "bg-brand-green-500 text-emerald-600",
  Pending: "bg-gold-500 text-amber-600",
  Archived: "bg-slate-400 text-slate-500",
};

export function ListingsTable({
  title,
  listings,
  onViewAllHref,
}: {
  title?: string;
  listings: Listing[];
  onViewAllHref?: string;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggleExpand = (id: string | undefined) => {
    if (!id) return;
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="rounded-2xl border border-portal-border bg-white p-4 sm:p-5 shadow-xs">
      {(title || onViewAllHref) && (
        <div className="mb-4 flex items-center justify-between">
          {title ? (
            <h2 className="text-base font-bold text-portal-ink">{title}</h2>
          ) : (
            <div />
          )}
          {onViewAllHref && (
            <Link
              href={onViewAllHref}
              className="text-sm font-semibold text-portal-blue-600 hover:underline"
            >
              View All
            </Link>
          )}
        </div>
      )}

      {/* Mobile Card View (screens < 768px) */}
      <div className="block space-y-3 md:hidden">
        {listings.map((listing, index) => {
          const isExpanded = listing.id ? expandedId === listing.id : false;
          const raw = (listing.rawItem as Record<string, unknown>) || {};
          const images = raw.images as string[] | undefined;

          return (
            <div
              key={listing.id || `${listing.name}-${index}`}
              className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  {listing.image ? (
                    <img
                      src={listing.image}
                      alt="Thumbnail"
                      className="h-8 w-8 shrink-0 rounded-md border border-portal-border object-cover"
                    />
                  ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-portal-border bg-slate-100" aria-hidden>
                      {listing.emoji}
                    </span>
                  )}
                  <span className="font-bold text-portal-ink text-xs truncate">
                    {listing.name}
                  </span>
                </div>
                <span
                  className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold ${TYPE_STYLES[listing.type]}`}
                >
                  {listing.type}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="font-black text-portal-ink">{listing.price}</span>
                <span className="text-slate-500 text-[11px]">{listing.views} views</span>
                <span className="inline-flex items-center gap-1 font-bold text-[10px] text-emerald-600">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLES[listing.status].split(" ")[0]}`}
                  />
                  {listing.status}
                </span>
              </div>

              {isExpanded && (
                <div className="mt-3 rounded-lg bg-slate-50/50 p-3 text-sm border border-slate-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="mb-2 font-bold text-slate-800 text-xs">Details</h4>
                      <ul className="space-y-1 text-slate-600 text-xs">
                        <li><span className="font-semibold text-slate-900">Brand:</span> {raw.brand as string || "N/A"}</li>
                        <li><span className="font-semibold text-slate-900">Model:</span> {raw.model as string || "N/A"}</li>
                        <li><span className="font-semibold text-slate-900">Year:</span> {raw.year as number || "N/A"}</li>
                        <li><span className="font-semibold text-slate-900">Condition:</span> {raw.condition as string || "N/A"}</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="mb-2 font-bold text-slate-800 text-xs">Stock</h4>
                      <ul className="space-y-1 text-slate-600 text-xs">
                        <li><span className="font-semibold text-slate-900">In Stock:</span> {raw.inStock ? "Yes" : "No"}</li>
                      </ul>
                    </div>
                  </div>
                  {Array.isArray(raw.keyFeatures) && raw.keyFeatures.length > 0 && (
                    <div className="mt-3">
                      <h4 className="mb-2 font-bold text-slate-800 text-[10px]">Key Features</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {raw.keyFeatures.map((feature, i) => (
                          <span key={i} className="rounded-md bg-slate-200/60 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                            {String(feature)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {listing.id && (
                <button
                  type="button"
                  onClick={() => toggleExpand(listing.id)}
                  className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-portal-ink hover:bg-slate-50"
                >
                  {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {isExpanded ? "Close" : "View Details"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Table View (screens >= 768px) */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs font-semibold tracking-wide text-slate-400">
              <th className="pb-3 font-semibold">VEHICLE / PART</th>
              <th className="pb-3 font-semibold">TYPE</th>
              <th className="pb-3 font-semibold">PRICE</th>
              <th className="pb-3 font-semibold">VIEWS</th>
              <th className="pb-3 font-semibold">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing, index) => {
              const isExpanded = listing.id ? expandedId === listing.id : false;
              const raw = (listing.rawItem as Record<string, unknown>) || {};
              const images = raw.images as string[] | undefined;

              return (
                <Fragment key={listing.id || `${listing.name}-${index}`}>
                  <tr className={`border-t border-portal-border ${isExpanded ? "bg-slate-50/50 border-b-0" : ""}`}>
                    <td className="py-3.5 font-medium text-portal-ink text-xs">
                      <div className="flex items-center gap-3">
                        {listing.image ? (
                          <img
                            src={listing.image}
                            alt="Thumbnail"
                            className="h-8 w-10 shrink-0 rounded-md border border-portal-border object-cover"
                          />
                        ) : (
                          <span className="flex h-8 w-10 shrink-0 items-center justify-center rounded-md border border-portal-border bg-slate-100" aria-hidden>
                            {listing.emoji}
                          </span>
                        )}
                        <span className="truncate">{listing.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`rounded-md px-2 py-1 text-[11px] font-bold ${TYPE_STYLES[listing.type]}`}
                      >
                        {listing.type}
                      </span>
                    </td>
                    <td className="py-3.5 font-black text-portal-ink text-xs">
                      {listing.price}
                    </td>
                    <td className="py-3.5 text-[#4B5675] text-xs">
                      {listing.views}
                    </td>
                    <td className="py-3.5">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-[#059669]">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLES[listing.status].split(" ")[0]}`}
                        />
                        {listing.status}
                      </span>
                    </td>
                    <td className="py-3.5 w-10 pr-2">
                      {listing.id && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(listing.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        >
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="border-b border-portal-border bg-slate-50/50">
                      <td colSpan={6} className="px-6 py-5">
                        <div className="grid grid-cols-2 gap-8 lg:grid-cols-3">
                          <div className="col-span-2 lg:col-span-1">
                            <h4 className="mb-3 font-bold text-slate-800">
                              Listing Details
                            </h4>
                            <ul className="space-y-1.5 text-sm text-slate-600">
                              <li><span className="font-semibold text-slate-900">Brand:</span> {raw.brand as string || "N/A"}</li>
                              <li><span className="font-semibold text-slate-900">Model:</span> {raw.model as string || "N/A"}</li>
                              <li><span className="font-semibold text-slate-900">Year:</span> {raw.year as number || "N/A"}</li>
                              <li><span className="font-semibold text-slate-900">Condition:</span> {raw.condition as string || "N/A"}</li>
                              <li><span className="font-semibold text-slate-900">Color:</span> {raw.color as string || "N/A"}</li>
                            </ul>
                          </div>
                          <div className="col-span-2 lg:col-span-2">
                            <h4 className="mb-2 font-bold text-slate-800">Description</h4>
                            <p className="whitespace-pre-wrap leading-relaxed text-sm text-slate-600">
                              {raw.description as string || "No description provided."}
                            </p>
                            {Array.isArray(raw.keyFeatures) && raw.keyFeatures.length > 0 && (
                              <div className="mt-4">
                                <h4 className="mb-2 font-bold text-slate-800 text-sm">Key Features</h4>
                                <div className="flex flex-wrap gap-2">
                                  {raw.keyFeatures.map((feature, i) => (
                                    <span key={i} className="rounded-md bg-slate-200/60 px-2 py-1 text-xs font-medium text-slate-700">
                                      {String(feature)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {images && images.length > 0 && (
                              <div className="mt-5">
                                <h4 className="mb-3 font-bold text-slate-800">Images</h4>
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                  {images.map((img, i) => (
                                    <a key={i} href={img} target="_blank" rel="noreferrer">
                                      <img
                                        src={img}
                                        alt={`Image ${i + 1}`}
                                        className="h-16 w-24 shrink-0 rounded-lg border border-slate-200 object-cover shadow-sm transition hover:opacity-80"
                                      />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
