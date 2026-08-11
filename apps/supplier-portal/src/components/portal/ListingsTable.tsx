import Link from "next/link";

export interface Listing {
  name: string;
  emoji: string;
  type: "NEW CAR" | "USED CAR" | "PART";
  price: string;
  views: number;
  status: "Active" | "Pending" | "Archived";
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
        {listings.map((listing, index) => (
          <div
            key={`${listing.name}-${index}`}
            className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-portal-ink text-xs truncate">
                <span className="mr-1.5" aria-hidden>
                  {listing.emoji}
                </span>
                {listing.name}
              </span>
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
          </div>
        ))}
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
            {listings.map((listing, index) => (
              <tr key={`${listing.name}-${index}`} className="border-t border-portal-border">
                <td className="py-3.5 font-medium text-portal-ink text-xs">
                  <span className="mr-2" aria-hidden>
                    {listing.emoji}
                  </span>
                  {listing.name}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
