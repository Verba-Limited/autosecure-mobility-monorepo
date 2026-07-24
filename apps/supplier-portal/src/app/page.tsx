import { PortalShell } from "@/components/portal/PortalShell";
import { StatCard, PlanCard } from "@/components/portal/StatCard";
import { QuickActionCard } from "@/components/portal/QuickActionCard";
import { ListingsTable, type Listing } from "@/components/portal/ListingsTable";

const RECENT_LISTINGS: Listing[] = [
  {
    name: "BMW 5 Series 530i 2025",
    emoji: "🚗",
    type: "NEW CAR",
    price: "₦45,000,000",
    views: 312,
    status: "Active",
  },
  {
    name: "Mercedes C300 2022",
    emoji: "🚙",
    type: "USED CAR",
    price: "₦16,500,000",
    views: 187,
    status: "Active",
  },
  {
    name: '18" Alloy Wheel Set',
    emoji: "🔧",
    type: "PART",
    price: "₦243,000",
    views: 94,
    status: "Active",
  },
];

export default function DashboardPage() {
  return (
    <PortalShell>
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight text-portal-ink">
          Welcome back, AutoSecure Ltd 👋
        </h1>
        <p className="mt-1.5 text-sm text-[#7B8DB0]">
          Here&apos;s your performance overview for this week.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="TOTAL LISTINGS" value="8" delta="+2 this week" />
        <StatCard label="TOTAL VIEWS" value="1,247" delta="+18% vs last week" />
        <StatCard label="WHATSAPP LEADS" value="34" delta="+12 this week" />
        <PlanCard planName="Premium" renewsOn="July 30, 2025" />
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-base font-bold text-portal-ink">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            label="List New Car"
            href="/list-new-car"
            iconSrc="/nav-icons/%F0%9F%9A%97.png"
          />
          <QuickActionCard
            label="List Used Car"
            href="/list-used-car"
            iconSrc="/nav-icons/%F0%9F%8F%B7%EF%B8%8F.png"
          />
          <QuickActionCard
            label="List a Part"
            href="/list-a-part"
            iconSrc="/nav-icons/%F0%9F%94%A7.png"
          />
          <QuickActionCard
            label="Manage Listings"
            href="/my-listings"
            iconSrc="/nav-icons/%F0%9F%93%8B.png"
          />
        </div>
      </div>

      <ListingsTable
        title="Recent Listings"
        listings={RECENT_LISTINGS}
        onViewAllHref="/my-listings"
      />
    </PortalShell>
  );
}
