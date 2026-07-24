import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { PartsExplorer } from "@/components/parts/PartsExplorer";

export const metadata: Metadata = {
  title: "Aftermarket Parts | autoSecure Mobility",
  description:
    "Automotive parts with delivery options and direct WhatsApp support.",
};

export default function PartsPage() {
  return (
    <>
      <Header />
      <main className="bg-[#FFFDF7] px-6 pb-28 pt-14 lg:px-16">
        <div className="mx-auto max-w-[1210px]">
          <nav className="text-[13px] font-black text-[#8CA0C0]">
            <Link href="/" className="hover:text-navy-900/70">
              Home
            </Link>
            <span className="mx-3 text-[#D8E1EF]">/</span>
            <span className="text-[#E48700]">Aftermarket Parts</span>
          </nav>

          <h1 className="mt-6 text-5xl font-black leading-none tracking-[-0.055em] text-[#071225] sm:text-[58px]">
            Aftermarket <span className="text-[#E48700]">Parts</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] font-semibold leading-7 text-[#8CA0C0]">
            Get your parts delivered in less than 7 days
          </p>

          <div className="mt-7">
            <PartsExplorer />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
