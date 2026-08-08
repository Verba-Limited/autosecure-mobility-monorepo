import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { VehicleDetailClient } from "@/components/new-cars/VehicleDetailClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  return {
    title: "Vehicle Details | autoSecure Mobility",
    description:
      "View full specs, pricing, and contact the supplier for this brand-new vehicle on autoSecure Mobility.",
  };
  void params; // id is used client-side
}

export default async function NewCarDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Header />
      <main className="relative overflow-hidden bg-white px-6 pb-24 pt-14 lg:px-16">
        <div className="mx-auto max-w-[1210px]">
          <nav className="text-[13px] font-black text-[#8CA0C0]">
            <Link href="/" className="hover:text-navy-900/70">
              Home
            </Link>
            <span className="mx-3 text-[#D8E1EF]">/</span>
            <Link href="/new-cars" className="text-[#2454D6] hover:underline">
              New Cars
            </Link>
          </nav>

          <VehicleDetailClient id={id} />
        </div>
      </main>
      <Footer />
    </>
  );
}
