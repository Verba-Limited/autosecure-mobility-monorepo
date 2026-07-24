"use client";

import { useMemo, useState } from "react";
import { Search, Tag } from "lucide-react";
import { USED_CAR_FILTERS, type UsedCar } from "@/data/usedCars";
import { UsedCarCard } from "@/components/used-cars/UsedCarCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type SortOption = "price-asc" | "price-desc";

const SORT_LABELS: Record<SortOption, string> = {
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
};

export function UsedCarsExplorer({ cars }: { cars: UsedCar[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("price-asc");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? cars.filter((car) =>
          `${car.brand} ${car.model} ${car.year}`.toLowerCase().includes(q),
        )
      : cars;

    if (sort === "price-desc") {
      return [...filtered].sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [cars, query, sort]);

  return (
    <div>
      <ScrollReveal
        className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end"
        variant="fade-up"
      >
        <div>
          <h1 className="text-5xl font-black leading-none tracking-[-0.055em] text-[#071225] sm:text-[58px]">
            Used Cars &amp; <span className="text-[#14B8A6]">Deals</span>
          </h1>
          <p className="mt-5 max-w-3xl text-[17px] font-normal leading-7 text-[#8CA0C0]">
            Certified pre-owned vehicles with full inspection reports. Trusted.
            Verified. Affordable.
          </p>
        </div>

        <label className="relative mb-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#071225]" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search make, model, year..."
            className="h-12 w-full rounded-[10px] border border-[#DDE6F2] bg-white pl-12 pr-4 text-sm font-semibold text-[#071225] placeholder:text-[#8CA0C0] focus:border-[#0F9283]/50 focus:outline-none"
          />
        </label>
      </ScrollReveal>

      <ScrollReveal
        className="mt-6 rounded-[12px] bg-[#0F766E] px-7 py-5 text-white shadow-[0_12px_24px_rgba(15,146,131,0.16)]"
        delay={80}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <Tag className="h-8 w-8 fill-[#FFD19A] text-[#FFD19A]" />
            <div>
              <p className="text-[13px] font-black uppercase tracking-[0.12em] text-white/75">
                Flash Sale
              </p>
              <p className="mt-1 text-[17px] font-black">
                Up to 25% off on selected used vehicles this week only!
              </p>
            </div>
          </div>
          <button
            type="button"
            className="h-10 rounded-[8px] border border-white/25 bg-white/15 px-7 text-[13px] font-black text-white"
          >
            View Sale Items
          </button>
        </div>
      </ScrollReveal>

      <ScrollReveal
        className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        delay={140}
      >
        <div className="flex flex-wrap gap-3">
          {USED_CAR_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              className="h-10 rounded-[7px] border border-[#DDE6F2] bg-white px-5 text-[13px] font-normal text-[#071225] hover:bg-[#F6F8FC]"
            >
              {filter}
            </button>
          ))}
        </div>

        <label className="flex items-center justify-end gap-3 text-sm font-normal text-[#8CA0C0]">
          Sort:
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="h-10 rounded-[8px] border-0 bg-[#EEF1F6] px-4 text-sm font-normal text-[#071225] focus:outline-none"
          >
            {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
      </ScrollReveal>

      <ScrollReveal delay={180}>
        <p className="mt-24 text-sm font-black text-[#8CA0C0]">
          Showing <span className="text-[#071225]">{results.length}</span>{" "}
          results
        </p>
      </ScrollReveal>

      {results.length > 0 ? (
        <div className="mt-8 grid gap-x-7 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
          {results.map((car, index) => (
            <ScrollReveal key={car.id} delay={(index % 3) * 90}>
              <UsedCarCard car={car} />
            </ScrollReveal>
          ))}
        </div>
      ) : (
        <ScrollReveal className="mt-8 rounded-2xl border border-dashed border-[#DDE6F2] py-16 text-center">
          <p className="text-base font-black text-[#071225]">
            No matching used cars
          </p>
          <p className="mt-1 text-sm font-semibold text-[#8CA0C0]">
            Try a different make, model, or year.
          </p>
        </ScrollReveal>
      )}
    </div>
  );
}
