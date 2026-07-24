import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { NewCarsExplorer } from "@/components/new-cars/NewCarsExplorer";
import { CARS } from "@/data/cars";

export const metadata: Metadata = {
  title: "Brand-New Vehicles | autoSecure Mobility",
  description:
    "Factory-fresh cars from top manufacturers. Specs, video, and flexible pricing.",
};

export default function NewCarsPage() {
  return (
    <>
      <Header />
      <main className="bg-white px-6 pb-24 pt-14 lg:px-16">
        <div className="mx-auto max-w-[1210px]">
          <nav className="text-[13px] font-black text-[#8CA0C0]">
            <Link href="/" className="hover:text-navy-900/70">
              Home
            </Link>
            <span className="mx-3 text-[#D8E1EF]">/</span>
            <span className="text-[#2454D6]">New Cars</span>
          </nav>

          <h1 className="mt-6 text-5xl font-black leading-none tracking-[-0.055em] text-[#071225] sm:text-[58px]">
            Brand-New <span className="text-[#1588A0]">Vehicles</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] font-semibold leading-7 text-[#8CA0C0]">
            Factory-fresh cars from top manufacturers. Specs, video, and
            flexible pricing.
          </p>

          <div className="mt-8">
            <NewCarsExplorer cars={CARS} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
