"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { CarListingCard } from "@/components/new-cars/CarListingCard";
import { fetchNewCars } from "@/lib/catalog-api";
import { CARS } from "@/data/cars";
import type { Car } from "@/data/cars";
import Link from "next/link";

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[18px] border border-[#DDE6F2] bg-white">
      <div className="h-[198px] bg-slate-100" />
      <div className="space-y-3 p-6">
        <div className="h-3 w-1/3 rounded bg-slate-100" />
        <div className="h-5 w-2/3 rounded bg-slate-200" />
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="h-10 rounded bg-slate-100" />
          <div className="h-10 rounded bg-slate-100" />
          <div className="h-10 rounded bg-slate-100" />
        </div>
        <div className="mt-2 h-8 rounded bg-slate-100" />
        <div className="mt-4 h-6 w-1/2 rounded bg-slate-200" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="h-11 rounded-[8px] bg-slate-100" />
          <div className="h-11 rounded-[8px] bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export function FeaturedCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const fetched = await fetchNewCars();
        if (!cancelled) {
          // Show up to 3 featured cars; fall back to static mocks if API is empty
          setCars(fetched.length > 0 ? fetched.slice(0, 3) : CARS.slice(0, 3));
        }
      } catch {
        if (!cancelled) {
          // API unavailable — show static mock cars
          setCars(CARS.slice(0, 3));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <section id="new-cars" className="bg-white px-6 py-24 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center rounded-full bg-cream-100 px-4 py-1.5 text-xs font-semibold text-gold-600">
              Just Arrived
            </span>
            <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-navy-900 sm:text-5xl">
              Featured <span className="text-gold-500">New Cars</span>
            </h2>
          </div>
          <Link
            href="/new-cars"
            className="inline-flex items-center gap-2 rounded-full border border-navy-900/15 px-5 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-900/[0.03]"
          >
            View Full Catalogue
            <ArrowRight className="h-4 w-4" />
          </Link>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {isLoading ? (
            // Show 3 skeleton placeholders while fetching
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            cars.map((car, index) => (
              <ScrollReveal
                key={car.id}
                delay={index * 120}
              >
                <CarListingCard car={car} />
              </ScrollReveal>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
