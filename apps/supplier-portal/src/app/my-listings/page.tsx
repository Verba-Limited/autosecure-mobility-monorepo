import Image from "next/image";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { PortalShell } from "@/components/portal/PortalShell";

const TYPE_STYLES = {
  "NEW CAR": "bg-portal-blue-600/10 text-portal-blue-600",
  "USED CAR": "bg-brand-green-500/10 text-emerald-700",
  PART: "bg-gold-100 text-gold-600",
};

const listings = [
  {
    name: "BMW 5 Series 530i 2025",
    added: "Added 2 days ago",
    category: "NEW CAR",
    price: "45,000,000",
    views: 312,
    leads: 12,
    iconSrc: "/nav-icons/%F0%9F%9A%97.png",
  },
  {
    name: "Mercedes C300 2022",
    added: "Added 4 days ago",
    category: "USED CAR",
    price: "16,500,000",
    views: 187,
    leads: 9,
    iconSrc: "/nav-icons/%F0%9F%9A%97.png",
  },
  {
    name: '18" Alloy Wheel Set',
    added: "Added 1 week ago",
    category: "PART",
    price: "243,000",
    views: 94,
    leads: 2,
    iconSrc: "/nav-icons/%F0%9F%94%A7.png",
  },
  {
    name: "Toyota Camry 2024",
    added: "Added 1 week ago",
    category: "NEW CAR",
    price: "32,000,000",
    views: 412,
    leads: 18,
    iconSrc: "/nav-icons/%F0%9F%9A%97.png",
  },
  {
    name: "Lexus RX 350 2020",
    added: "Added 2 weeks ago",
    category: "USED CAR",
    price: "22,000,000",
    views: 245,
    leads: 11,
    iconSrc: "/nav-icons/%F0%9F%9A%97.png",
  },
  {
    name: "Brembo Brake Pad Kit",
    added: "Added 2 weeks ago",
    category: "PART",
    price: "75,000",
    views: 48,
    leads: 0,
    iconSrc: "/nav-icons/%F0%9F%94%A7.png",
  },
];

export default function MyListingsPage() {
  return (
    <PortalShell>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-portal-ink">
            My Listings
          </h1>
          <p className="mt-1.5 text-sm font-medium text-[#64748B]">
            View, edit, search, and manage all your active and sold listings.
          </p>
        </div>
        <Link
          href="/list-new-car"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-portal-blue-600 px-5 text-sm font-bold text-white transition-colors hover:bg-portal-blue-700"
        >
          <Plus className="h-4 w-4" />
          List a Vehicle / Part
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-portal-border bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex w-full rounded-lg bg-slate-100 p-1 text-sm font-bold text-[#64748B] sm:w-auto">
          {["All (8)", "New Cars (2)", "Used Cars (4)", "Parts (2)"].map(
            (tab, index) => (
              <button
                key={tab}
                className={`rounded-md px-4 py-2 ${index === 0 ? "bg-white text-portal-blue-600 shadow-sm" : ""}`}
              >
                {tab}
              </button>
            ),
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <input
              placeholder="Search vehicle or part..."
              className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm font-medium text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15 sm:w-64"
            />
          </label>
          <select className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15">
            <option>Sort by: Most Recent</option>
            <option>Sort by: Most Viewed</option>
            <option>Sort by: Price</option>
          </select>
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-xl border border-portal-border bg-white shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1080px] table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[27%]" />
              <col className="w-[13%]" />
              <col className="w-[13%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
              <col className="w-[10%]" />
              <col className="w-[21%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-portal-border text-xs font-black uppercase tracking-wide text-[#64748B]">
                <th className="whitespace-nowrap px-6 py-5">Vehicle / Part</th>
                <th className="whitespace-nowrap px-6 py-5">Category</th>
                <th className="whitespace-nowrap px-6 py-5">Price</th>
                <th className="whitespace-nowrap px-6 py-5">Views</th>
                <th className="whitespace-nowrap px-6 py-5">Leads</th>
                <th className="whitespace-nowrap px-6 py-5">Status</th>
                <th className="whitespace-nowrap px-6 py-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr
                  key={listing.name}
                  className="border-b border-portal-border last:border-b-0"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-portal-border bg-slate-100">
                        <Image
                          src={listing.iconSrc}
                          alt=""
                          width={24}
                          height={24}
                          aria-hidden="true"
                        />
                      </span>
                      <span>
                        <span className="block max-w-[210px] truncate whitespace-nowrap font-black text-portal-ink">
                          {listing.name}
                        </span>
                        <span className="block whitespace-nowrap text-xs font-semibold text-[#64748B]">
                          {listing.added}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-md px-3 py-1.5 text-xs font-black ${TYPE_STYLES[listing.category as keyof typeof TYPE_STYLES]}`}
                    >
                      {listing.category}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-black text-portal-ink">
                    {"\u20A6"}
                    {listing.price}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-bold text-portal-ink">
                    {listing.views}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-bold text-portal-ink">
                    {listing.leads}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center gap-2 text-sm font-black text-emerald-600">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <button className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-black text-portal-ink hover:bg-slate-50">
                        Edit
                      </button>
                      <button className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-black text-portal-ink hover:bg-slate-50">
                        Mark Sold
                      </button>
                      <button className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-black text-red-500 hover:bg-red-100">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PortalShell>
  );
}
