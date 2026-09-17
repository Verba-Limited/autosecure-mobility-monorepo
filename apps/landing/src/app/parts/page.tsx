import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { PartsExplorer } from "@/components/parts/PartsExplorer";
import { getCatalogParts } from "@/lib/catalog-api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aftermarket Parts | autoSecure Mobility",
  description:
    "Automotive parts with delivery options and direct WhatsApp support.",
};

export default async function PartsPage() {
  const products = await getCatalogParts();

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
            <span className="text-amber-400">Aftermarket Parts</span>
          </nav>

          <h1 className="mt-6 text-5xl font-black leading-none tracking-[-0.055em] text-white sm:text-[58px]">
            Aftermarket <span className="text-amber-400">Parts</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] font-normal leading-7 text-white/40">
            Get your parts delivered in less than 7 days
          </p>

          <div className="mt-7">
            <PartsExplorer products={products} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
