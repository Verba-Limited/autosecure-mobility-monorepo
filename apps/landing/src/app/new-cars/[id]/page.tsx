import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { VehicleDetailsView } from "@/components/new-cars/VehicleDetailsView";
import { CARS } from "@/data/cars";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return CARS.map((car) => ({ id: car.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const car = CARS.find((item) => item.id === id);

  if (!car) {
    return {
      title: "Vehicle Not Found | autoSecure Mobility",
    };
  }

  return {
    title: `${car.brand} ${car.model} | autoSecure Mobility`,
    description: `View details, specs, and checkout options for the ${car.brand} ${car.model}.`,
  };
}

export default async function NewCarDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const car = CARS.find((item) => item.id === id);

  if (!car) {
    notFound();
  }

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

          <h1 className="mt-6 text-5xl font-black leading-none tracking-[-0.055em] text-[#071225] sm:text-[58px]">
            Brand-New <span className="text-[#1588A0]">Vehicles</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] font-semibold leading-7 text-[#8CA0C0]">
            Factory-fresh cars from top manufacturers. Specs, video, and
            flexible pricing.
          </p>

          <VehicleDetailsView car={car} />
        </div>
      </main>
      <Footer />
    </>
  );
}
