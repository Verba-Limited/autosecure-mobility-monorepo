import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { UsedCarsExplorer } from "@/components/used-cars/UsedCarsExplorer";
import { USED_CARS } from "@/data/usedCars";

export const metadata: Metadata = {
  title: "Used Cars & Deals | autoSecure Mobility",
  description:
    "Certified pre-owned vehicles with full inspection reports and direct WhatsApp support.",
};

export default function UsedCarsPage() {
  return (
    <>
      <Header />
      <main className="bg-[#F6FFFD] px-6 pb-28 pt-14 lg:px-16">
        <div className="mx-auto max-w-[1210px]">
          <nav className="text-[13px] font-black text-[#8CA0C0]">
            <Link href="/" className="hover:text-navy-900/70">
              Home
            </Link>
            <span className="mx-3 text-[#D8E1EF]">/</span>
            <span className="text-[#0F9283]">Used Cars &amp; Deals</span>
          </nav>

          <div className="mt-6">
            <UsedCarsExplorer cars={USED_CARS} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
