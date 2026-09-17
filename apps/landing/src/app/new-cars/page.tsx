import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { NewCarsExplorer } from "@/components/new-cars/NewCarsExplorer";
import { getCatalogVehicles } from "@/lib/catalog-api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Brand-New Vehicles | autoSecure Mobility",
  description:
    "Factory-fresh cars from top manufacturers. Specs, video, and flexible pricing.",
};

export default async function NewCarsPage() {
  const cars = await getCatalogVehicles();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black px-6 pb-24 pt-14 lg:px-16">
        <div className="mx-auto max-w-[1210px]">
          {/* Breadcrumb */}
          <nav className="text-[13px] font-semibold text-white/30">
            <Link href="/" className="hover:text-white/60 transition-colors">
              Home
            </Link>
            <span className="mx-3 text-white/15">/</span>
            <span className="text-[#C9943A]">New Cars</span>
          </nav>

          <h1 className="mt-6 text-5xl font-black leading-none tracking-[-0.055em] text-white sm:text-[58px]">
            Brand-New <span className="text-[#C9943A]">Vehicles</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] font-semibold leading-7 text-white/40">
            Factory-fresh cars from top manufacturers. Specs, video, and
            flexible pricing.
          </p>

          <div className="mt-8">
            <NewCarsExplorer cars={cars} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
