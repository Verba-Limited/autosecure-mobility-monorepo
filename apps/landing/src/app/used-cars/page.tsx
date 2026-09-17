import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { UsedCarsExplorer } from "@/components/used-cars/UsedCarsExplorer";
import { getCatalogUsedCars } from "@/lib/catalog-api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Used Cars & Deals | autoSecure Mobility",
  description:
    "Certified pre-owned vehicles with full inspection reports and direct WhatsApp support.",
};

export default async function UsedCarsPage() {
  const cars = await getCatalogUsedCars();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black px-6 pb-28 pt-12 lg:px-16">
        <div className="mx-auto max-w-[1210px]">
          <nav className="flex items-center gap-2 text-[13px] font-semibold text-white/30">
            <Link href="/" className="hover:text-white/60 transition-colors">
              Home
            </Link>
            <span className="text-white/15">/</span>
            <span className="text-emerald-400">Used Cars &amp; Deals</span>
          </nav>

          <div className="mt-6">
            <UsedCarsExplorer cars={cars} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}