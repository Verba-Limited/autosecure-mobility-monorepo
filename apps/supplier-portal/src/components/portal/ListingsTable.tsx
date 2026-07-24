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
  Active: "bg-brand-green-500",
  Pending: "bg-gold-500",
  Archived: "bg-slate-400",
};

export function ListingsTable({
  title,
  listings,
  onViewAllHref,
}: {
  title: string;
  listings: Listing[];
  onViewAllHref?: string;
}) {
  return (
    <div className="rounded-2xl border border-portal-border bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-portal-ink">{title}</h2>
        {onViewAllHref && (
          <a
            href={onViewAllHref}
            className="text-sm font-semibold text-portal-blue-600 hover:underline"
          >
            View All
          </a>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
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
            {listings.map((listing) => (
              <tr key={listing.name} className="border-t border-portal-border">
                <td className="py-3.5 font-medium text-portal-ink text-[10px]">
                  <span className="mr-2" aria-hidden>
                    {listing.emoji}
                  </span>
                  {listing.name}
                </td>
                <td className="py-3.5">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-semibold text-[10px] ${TYPE_STYLES[listing.type]}`}
                  >
                    {listing.type}
                  </span>
                </td>
                <td className="py-3.5 text-portal-ink font-black text-[10px]">
                  {listing.price}
                </td>
                <td className="py-3.5 text-[#4B5675] text-[10px]">
                  {listing.views}
                </td>
                <td className="py-3.5">
                  <span className="flex items-center gap-1.5 font-bold text-[#059669] text-[9px]">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLES[listing.status]}`}
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
