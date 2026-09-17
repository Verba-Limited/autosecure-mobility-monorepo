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
    <div className="animate-pulse overflow-hidden rounded-[18px] border border-white/8 bg-[#111]">
      <div className="h-[198px] bg-white/5" />
      <div className="space-y-3 p-6">
        <div className="h-3 w-1/3 rounded bg-white/8" />
        <div className="h-5 w-2/3 rounded bg-white/10" />
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="h-10 rounded bg-white/5" />
          <div className="h-10 rounded bg-white/5" />
          <div className="h-10 rounded bg-white/5" />
        </div>
        <div className="mt-2 h-8 rounded bg-white/5" />
        <div className="mt-4 h-6 w-1/2 rounded bg-white/8" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="h-11 rounded-[8px] bg-white/5" />
          <div className="h-11 rounded-[8px] bg-white/8" />
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
    <section id="new-cars" className="bg-[#242424] px-6 py-24 lg:px-16">
      {/* Divider */}
      <div className="mx-auto mb-16 h-px max-w-7xl bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#C9943A]/20 bg-[#C9943A]/10 px-4 py-1.5 text-xs font-bold text-[#C9943A]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C9943A]" />
              Just Arrived
            </span>
            <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Featured <span className="text-[#C9943A]">New Cars</span>
            </h2>
          </div>
          <Link
            href="/new-cars"
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/60 transition-all hover:bg-white/10 hover:text-white hover:border-white/20"
          >
            View Full Catalogue
            <ArrowRight className="h-4 w-4" />
          </Link>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            cars.map((car, index) => (
              <ScrollReveal key={car.id} delay={index * 120}>
                <CarListingCard car={car} layout="grid" />
              </ScrollReveal>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
