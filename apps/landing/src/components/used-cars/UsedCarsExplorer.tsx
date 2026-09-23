"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Tag } from "lucide-react";
import { USED_CAR_FILTERS, type UsedCar } from "@/data/usedCars";
import { UsedCarCard } from "@/components/used-cars/UsedCarCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { fetchUsedCars } from "@/lib/catalog-api";
import {
  VehicleFilterSidebar,
  type VehicleFilterValues,
  INITIAL_FILTERS,
} from "@/components/catalog/VehicleFilterSidebar";

type SortOption = "price-asc" | "price-desc";

const SORT_LABELS: Record<SortOption, string> = {
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
};

function matchesPriceRange(price: number, key: string): boolean {
  if (!key || key === "all") return true;
  if (key === "under-35") return price < 35_000_000;
  if (key === "35-65") return price >= 35_000_000 && price <= 65_000_000;
  if (key === "65-100") return price >= 65_000_000 && price <= 100_000_000;
  if (key === "above-100") return price > 100_000_000;
  return true;
}

function matchesUsedCarSearch(car: UsedCar, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const words = q.split(/\s+/).filter(Boolean);

  const haystack = [
    car.brand,
    car.model,
    car.category,
    car.condition,
    car.fuelType,
    car.bodyType,
    car.driveType,
    car.transmission,
    car.countryOfOrigin,
    String(car.year ?? ""),
    ...(car.colors?.map((c) => c.name) ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return words.every((word) => haystack.includes(word));
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/8 bg-[#0d0d0d] overflow-hidden">
      <div className="h-52 bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-2/3 rounded bg-white/5" />
        <div className="h-3 w-1/2 rounded bg-white/5" />
        <div className="h-5 w-1/3 rounded bg-white/10" />
      </div>
    </div>
  );
}

export function UsedCarsExplorer({ cars: initialCars }: { cars: UsedCar[] }) {
  const [cars, setCars] = useState<UsedCar[]>(initialCars);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [filters, setFilters] = useState<VehicleFilterValues>(INITIAL_FILTERS);
  const [sort, setSort] = useState<SortOption>("price-asc");

  // Fetch real USED_CAR inventory from browser
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const mapped = await fetchUsedCars();
        if (!cancelled && mapped.length > 0) {
          setCars(mapped);
        }
      } catch {
        // Keep server-provided fallback
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(() => {
    let filtered = cars;

    // Quick filter chips
    if (activeCategory === "Hot Deals") {
      filtered = filtered.filter(
        (c) =>
          Boolean(c.dealBadge) ||
          Boolean((c as any).isHotDeal) ||
          (c.originalPrice && c.originalPrice > c.price) ||
          c.condition === "Like New" ||
          c.condition === "Excellent",
      );
    } else if (activeCategory === "Hybrid") {
      filtered = filtered.filter(
        (c) =>
          c.category === "Hybrid" ||
          c.fuelType?.toLowerCase().includes("hybrid"),
      );
    } else if (activeCategory === "Sedan") {
      filtered = filtered.filter(
        (c) => c.category === "Sedan" || c.bodyType?.toLowerCase() === "sedan",
      );
    } else if (activeCategory === "SUV") {
      filtered = filtered.filter(
        (c) => c.category === "SUV" || c.bodyType?.toLowerCase() === "suv",
      );
    } else if (activeCategory === "Under ₦35m") {
      filtered = filtered.filter((c) => c.price < 35_000_000);
    } else if (activeCategory === "Luxury") {
      filtered = filtered.filter((c) => c.price >= 45_000_000);
    }

    // Search query
    if (filters.query) {
      filtered = filtered.filter((car) =>
        matchesUsedCarSearch(car, filters.query),
      );
    }

    // Manufacturer / Brand
    if (filters.brand) {
      filtered = filtered.filter(
        (car) => car.brand.toLowerCase() === filters.brand.toLowerCase(),
      );
    }

    // Model
    if (filters.model) {
      filtered = filtered.filter((car) =>
        car.model.toLowerCase().includes(filters.model.toLowerCase()),
      );
    }

    // Price range
    if (filters.priceRangeKey && filters.priceRangeKey !== "all") {
      filtered = filtered.filter((car) =>
        matchesPriceRange(car.price, filters.priceRangeKey),
      );
    }

    // Year
    if (filters.year) {
      filtered = filtered.filter((car) => String(car.year) === filters.year);
    }

    // Colour
    if (filters.color) {
      const colorQuery = filters.color.toLowerCase();
      filtered = filtered.filter(
        (car) =>
          car.colors &&
          car.colors.some(
            (c) =>
              c.name.toLowerCase().includes(colorQuery) ||
              colorQuery.includes(c.name.toLowerCase()),
          ),
      );
    }

    // Fuel / Powertrain
    if (filters.fuelType) {
      const fuel = filters.fuelType.toLowerCase();
      filtered = filtered.filter((car) => {
        const carFuel = (car.fuelType || "").toLowerCase();
        if (fuel.includes("electric")) return carFuel.includes("electric");
        if (fuel.includes("plug-in")) return carFuel.includes("plug-in");
        if (fuel.includes("hybrid")) return carFuel.includes("hybrid");
        if (fuel.includes("diesel")) return carFuel.includes("diesel");
        if (fuel.includes("petrol"))
          return carFuel.includes("petrol") || carFuel.includes("gas");
        return carFuel.includes(fuel);
      });
    }

    // Body Type
    if (filters.bodyType) {
      const bt = filters.bodyType.toLowerCase();
      filtered = filtered.filter((car) => {
        const carBt = (car.bodyType || car.category || "").toLowerCase();
        return carBt.includes(bt) || bt.includes(carBt);
      });
    }

    // Drive Type
    if (filters.driveType) {
      const dt = filters.driveType.toLowerCase();
      filtered = filtered.filter((car) => {
        const carDt = (car.driveType || "").toLowerCase();
        if (dt.includes("awd") || dt.includes("4wd")) {
          return (
            carDt.includes("awd") ||
            carDt.includes("4wd") ||
            carDt.includes("all")
          );
        }
        if (dt.includes("fwd"))
          return carDt.includes("fwd") || carDt.includes("front");
        if (dt.includes("rwd"))
          return carDt.includes("rwd") || carDt.includes("rear");
        return carDt.includes(dt);
      });
    }

    // Seating Capacity
    if (filters.seatingCapacity) {
      const seatsCount = filters.seatingCapacity.replace(/\D/g, "");
      filtered = filtered.filter((car) => {
        if (car.seatingCapacity === undefined || car.seatingCapacity === null)
          return true;
        return String(car.seatingCapacity).includes(seatsCount);
      });
    }

    // Transmission
    if (filters.transmission) {
      const trans = filters.transmission.toLowerCase();
      filtered = filtered.filter((car) => {
        const carTrans = (car.transmission || "").toLowerCase();
        return carTrans.includes(trans) || trans.includes(carTrans);
      });
    }

    // Country of Origin
    if (filters.countryOfOrigin) {
      filtered = filtered.filter(
        (car) =>
          car.countryOfOrigin?.toLowerCase() ===
          filters.countryOfOrigin.toLowerCase(),
      );
    }

    if (sort === "price-desc") {
      return [...filtered].sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [cars, activeCategory, filters, sort]);

  return (
    <div className="space-y-8">
      <ScrollReveal
        className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end"
        variant="fade-up"
      >
        <div>
          <h1 className="text-5xl font-black leading-none tracking-[-0.055em] text-white sm:text-[58px]">
            Used Cars &amp; <span className="text-emerald-400">Deals</span>
          </h1>
          <p className="mt-5 max-w-3xl text-[17px] font-normal leading-7 text-white/40">
            Certified pre-owned vehicles with full inspection reports. Trusted.
            Verified. High value.
          </p>
        </div>

        <div className="relative mb-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={filters.query}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, query: event.target.value }))
            }
            placeholder="Search make, model, year, trim..."
            className="h-12 w-full rounded-[10px] border border-white/10 bg-[#141414] pl-12 pr-4 text-sm font-semibold text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none transition-colors"
          />
        </div>
      </ScrollReveal>

      {/* Hot Deals Banner */}
      <ScrollReveal
        className="rounded-[12px] border border-emerald-500/25 bg-gradient-to-r from-emerald-950/80 via-[#0a231c]/90 to-emerald-950/70 px-7 py-5 text-white shadow-[0_12px_24px_rgba(0,0,0,0.5)]"
        delay={80}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <Tag className="h-8 w-8 fill-emerald-400 text-emerald-400" />
            <div>
              <p className="text-[13px] font-black uppercase tracking-[0.12em] text-emerald-400">
                Hot Deals &amp; Verified Pre-Owned
              </p>
              <p className="mt-1 text-[17px] font-black text-white">
                Special inspected inventory available with promotional pricing
                and warranty options!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveCategory("Hot Deals")}
            className="h-10 rounded-[8px] border border-emerald-500/30 bg-emerald-500/20 px-7 text-[13px] font-black text-emerald-300 hover:bg-emerald-500/30 transition-colors shadow-[0_4px_16px_rgba(52,211,153,0.2)]"
          >
            Hot Deals
          </button>
        </div>
      </ScrollReveal>

      {/* Main Layout: Sticky Sidebar + Results (Req 14 & Req 15) */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Filter Sidebar (Immediate access upon visiting category) */}
        <VehicleFilterSidebar
          filters={filters}
          onChange={(updated) =>
            setFilters((prev) => ({ ...prev, ...updated }))
          }
          onReset={() => {
            setFilters(INITIAL_FILTERS);
            setActiveCategory("All");
          }}
          totalResults={results.length}
        />

        {/* Results Area */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-white/8 pb-4">
            <div className="flex flex-wrap gap-2.5">
              {USED_CAR_FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveCategory(filter)}
                  className={`h-9 rounded-full px-4 text-xs font-bold transition-all ${
                    activeCategory === filter
                      ? "bg-emerald-400 text-black shadow-[0_4px_16px_rgba(52,211,153,0.3)]"
                      : "border border-white/8 bg-white/4 text-white/70 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-bold text-white/40">
                {isLoading ? (
                  "Loading…"
                ) : (
                  <>
                    <span className="text-white font-black">
                      {results.length}
                    </span>
                    {" results"}
                  </>
                )}
              </span>

              <label className="flex items-center gap-2 text-xs font-semibold text-white/40 whitespace-nowrap">
                Sort:
                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as SortOption)
                  }
                  className="h-9 rounded-lg border border-white/10 bg-[#141414] px-3 text-xs font-semibold text-white focus:outline-none"
                >
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                    <option
                      key={key}
                      value={key}
                      className="bg-[#141414] text-white"
                    >
                      {SORT_LABELS[key]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-6">
              {results.map((car, index) => (
                <ScrollReveal key={car.id} delay={(index % 3) * 80}>
                  <UsedCarCard car={car} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <ScrollReveal className="rounded-2xl border border-dashed border-white/10 bg-white/2 py-16 text-center">
              <p className="text-base font-black text-white">
                No matching used cars
              </p>
              <p className="mt-1 text-sm font-semibold text-white/40">
                Try loosening your filters or resetting your search parameters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilters(INITIAL_FILTERS);
                  setActiveCategory("All");
                }}
                className="mt-4 inline-flex items-center rounded-lg bg-emerald-400 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-300"
              >
                Reset All Filters
              </button>
            </ScrollReveal>
          )}
        </div>
      </div>
    </div>
  );
}
