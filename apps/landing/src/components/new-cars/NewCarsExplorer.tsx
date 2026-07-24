"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CATEGORY_FILTERS } from "@/data/categoryStyles";
import type { Car } from "@/data/cars";
import { CarListingCard } from "@/components/new-cars/CarListingCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type SortOption = "price-asc" | "price-desc";

const SORT_LABELS: Record<SortOption, string> = {
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
};

export function NewCarsExplorer({ cars }: { cars: Car[] }) {
  const [activeFilter, setActiveFilter] =
    useState<(typeof CATEGORY_FILTERS)[number]>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("price-asc");

  const results = useMemo(() => {
    let filtered = cars;

    if (activeFilter === "Used Cars") {
      filtered = [];
    } else if (activeFilter !== "All") {
      filtered = filtered.filter((car) => car.category === activeFilter);
    }

    const q = query.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((car) =>
        `${car.brand} ${car.model}`.toLowerCase().includes(q),
      );
    }

    if (sort === "price-desc") {
      return [...filtered].sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [cars, activeFilter, query, sort]);

  return (
    <div>
      <ScrollReveal
        className="grid gap-7 lg:grid-cols-[1fr_360px] lg:items-start"
        variant="fade-up"
      >
        <div className="flex flex-wrap gap-3">
          {CATEGORY_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`h-10 rounded-full px-5 text-[13px] font-black transition-colors ${
                activeFilter === filter
                  ? "bg-[#2454D6] text-white shadow-[0_8px_16px_rgba(36,84,214,0.2)]"
                  : "border border-[#DDE6F2] bg-white text-[#071225] hover:bg-[#F6F8FC]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-7">
          <label className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#071225]" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search make, model..."
              className="h-12 w-full rounded-[12px] border border-[#DDE6F2] bg-white pl-12 pr-4 text-sm font-semibold text-[#071225] placeholder:text-[#8CA0C0] focus:border-[#2454D6]/40 focus:outline-none"
            />
          </label>

          <label className="flex items-center justify-end gap-3 text-sm font-black text-[#8CA0C0]">
            Sort:
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className="h-10 rounded-[8px] border-0 bg-[#EEF1F6] px-4 text-sm font-black text-[#071225] focus:outline-none"
            >
              {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                <option key={key} value={key}>
                  {SORT_LABELS[key]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <p className="mt-14 text-sm font-black text-[#8CA0C0]">
          Showing{" "}
          <span className="text-[#071225]">{results.length}</span> results
        </p>
      </ScrollReveal>

      {results.length > 0 ? (
        <div className="mt-8 grid gap-x-7 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
          {results.map((car, index) => (
            <ScrollReveal key={car.id} delay={(index % 3) * 90}>
              <CarListingCard car={car} />
            </ScrollReveal>
          ))}
        </div>
      ) : (
        <ScrollReveal className="mt-8 rounded-2xl border border-dashed border-[#DDE6F2] py-16 text-center">
          <p className="text-base font-black text-[#071225]">
            No matching vehicles
          </p>
          <p className="mt-1 text-sm font-semibold text-[#8CA0C0]">
            {activeFilter === "Used Cars"
              ? "Used vehicles live on the Used Cars page."
              : "Try a different filter or search term."}
          </p>
        </ScrollReveal>
      )}
    </div>
  );
}
