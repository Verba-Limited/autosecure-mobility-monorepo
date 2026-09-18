"use client";

import { useEffect, useMemo, useState } from "react";
import { Grid2X2, Rows3, Search } from "lucide-react";
import { CATEGORY_FILTERS } from "@/data/categoryStyles";
import type { Car } from "@/data/cars";
import { CarListingCard } from "@/components/new-cars/CarListingCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { fetchCatalogFilters, fetchNewCars } from "@/lib/catalog-api";
import {
  VehicleFilterSidebar,
  type VehicleFilterValues,
  type VehicleFilterOptions,
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

function matchesSearch(car: Car, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const words = q.split(/\s+/).filter(Boolean);

  const haystack = [
    car.brand,
    car.model,
    car.vehicleType,
    car.bodyType,
    car.category,
    car.fuelType,
    car.powertrain,
    car.driveType,
    car.transmission,
    car.keySpec,
    car.countryOfOrigin,
    String(car.year ?? ""),
    ...(car.colors?.map((c) => c.name) ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return words.every((word) => haystack.includes(word));
}

function SkeletonRowCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-white/8 bg-[#0d0d0d]">
      <div className="grid lg:grid-cols-12 items-stretch">
        <div className="h-56 lg:h-full min-h-[240px] bg-white/5 lg:col-span-5" />
        <div className="p-7 lg:col-span-7 space-y-4">
          <div className="h-3 w-1/4 rounded bg-white/5" />
          <div className="h-6 w-1/2 rounded bg-white/10" />
          <div className="flex gap-2">
            <div className="h-6 w-24 rounded bg-white/5" />
            <div className="h-6 w-28 rounded bg-white/5" />
            <div className="h-6 w-32 rounded bg-white/5" />
          </div>
          <div className="h-5 w-40 rounded bg-white/5" />
          <div className="mt-6 flex justify-between pt-4 border-t border-white/6">
            <div className="h-8 w-32 rounded bg-white/10" />
            <div className="h-10 w-48 rounded bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonGridCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-white/8 bg-[#0d0d0d]">
      <div className="aspect-[16/10] bg-white/5" />
      <div className="p-6 space-y-3">
        <div className="h-3 w-1/3 rounded bg-white/5" />
        <div className="h-5 w-2/3 rounded bg-white/10" />
        <div className="flex gap-2">
          <div className="h-5 w-20 rounded bg-white/5" />
          <div className="h-5 w-24 rounded bg-white/5" />
        </div>
        <div className="mt-4 pt-4 border-t border-white/6 flex justify-between">
          <div className="h-6 w-24 rounded bg-white/10" />
          <div className="h-9 w-28 rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}

export function NewCarsExplorer({ cars: initialCars }: { cars: Car[] }) {
  const [cars, setCars] = useState<Car[]>(initialCars);
  const [isLoading, setIsLoading] = useState(true);
  const [layout, setLayout] = useState<"row" | "grid">("row");
  const [activeFilter, setActiveFilter] =
    useState<(typeof CATEGORY_FILTERS)[number]>("All");
  const [filters, setFilters] = useState<VehicleFilterValues>(INITIAL_FILTERS);
  const [sort, setSort] = useState<SortOption>("price-asc");
  const [backendFilterOptions, setBackendFilterOptions] =
    useState<VehicleFilterOptions | null>(null);

  // These choices follow the backend inventory, so admin-added makes, models
  // and taxonomy values appear without a frontend release.
  const filterOptions = useMemo<VehicleFilterOptions>(() => {
    const unique = (values: Array<string | undefined>) =>
      [...new Set(values.filter((value): value is string => Boolean(value)))].sort();
    return {
      brands: unique(cars.map((car) => car.brand)),
      years: unique(cars.map((car) => String(car.year))).sort((a, b) => b.localeCompare(a)),
      colors: unique(cars.flatMap((car) => car.colors?.map((color) => color.name) ?? [])).map((name) => ({ name, hex: "#7a8288" })),
      fuelTypes: unique(cars.map((car) => car.fuelType ?? car.powertrain)),
      bodyTypes: unique(cars.map((car) => car.bodyType ?? car.vehicleType)),
      driveTypes: unique(cars.map((car) => car.driveType)),
      seatingOptions: unique(cars.map((car) => car.seatingCapacity ? `${car.seatingCapacity} Seats` : undefined)),
      transmissions: unique(cars.map((car) => car.transmission)),
      countries: unique(cars.map((car) => car.countryOfOrigin)),
    };
  }, [cars]);

  useEffect(() => {
    let cancelled = false;
    fetchCatalogFilters().then((response) => {
      if (cancelled || !response.facets) return;
      const choices = new Map(
        response.facets.map((facet) => [
          facet.param || facet.key,
          facet.options.map((option) => option.label),
        ]),
      );
      const read = (...keys: string[]) =>
        keys.flatMap((key) => choices.get(key) ?? []);
      setBackendFilterOptions({
        brands: read("brand"),
        years: read("year"),
        colors: read("colour", "color").map((name) => ({ name, hex: "#7a8288" })),
        fuelTypes: read("powertrain", "fuelType"),
        bodyTypes: read("bodyType"),
        driveTypes: read("driveType"),
        seatingOptions: read("minSeats", "seatingCapacity").map((value) => /seat/i.test(value) ? value : `${value} Seats`),
        transmissions: read("transmission"),
        countries: read("countryOfOrigin"),
      });
    }).catch(() => {
      // The live-inventory values remain a useful non-blocking fallback.
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get("q")?.trim() ?? "";
    if (query) {
      setFilters((previous) => ({ ...previous, query }));
    }
  }, []);

  // Fetch real inventory from browser
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const mapped = await fetchNewCars();
        if (!cancelled && mapped.length > 0) {
          setCars(mapped);
        }
      } catch {
        // Keep initialCars (fallback)
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  // Comprehensive multi-factor filtering according to Requirements 13 & 14
  const results = useMemo(() => {
    let filtered = cars;

    // Quick Category Pill
    if (activeFilter === "Used Cars") {
      filtered = [];
    } else if (activeFilter === "Sedan") {
      filtered = filtered.filter(
        (c) =>
          c.bodyType?.toLowerCase() === "sedan" ||
          c.vehicleType?.toLowerCase() === "sedan" ||
          c.category === "Sedan",
      );
    } else if (activeFilter === "SUV") {
      filtered = filtered.filter(
        (c) =>
          c.bodyType?.toLowerCase() === "suv" ||
          c.vehicleType?.toLowerCase() === "suv" ||
          c.category === "SUV",
      );
    } else if (activeFilter === "Sports") {
      filtered = filtered.filter((c) => c.category === "Sports");
    } else if (activeFilter === "Electric") {
      filtered = filtered.filter(
        (c) =>
          c.fuelType?.toLowerCase().includes("electric") ||
          c.powertrain?.toLowerCase().includes("electric") ||
          c.category === "Electric",
      );
    } else if (activeFilter === "Truck") {
      filtered = filtered.filter((c) => c.category === "Truck");
    }

    // Search query (matching brand, manufacturer, model, vehicle type, powertrain, etc.)
    if (filters.query) {
      filtered = filtered.filter((car) => matchesSearch(car, filters.query));
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

    // Price Range
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

    // Fuel / Powertrain (Petrol, Diesel, Hybrid, Plug-in Hybrid, Fully Electric)
    if (filters.fuelType) {
      const fuel = filters.fuelType.toLowerCase();
      filtered = filtered.filter((car) => {
        const carFuel = (car.fuelType || car.powertrain || "").toLowerCase();
        if (fuel.includes("electric")) return carFuel.includes("electric");
        if (fuel.includes("plug-in")) return carFuel.includes("plug-in");
        if (fuel.includes("hybrid")) return carFuel.includes("hybrid");
        if (fuel.includes("diesel")) return carFuel.includes("diesel");
        if (fuel.includes("petrol")) return carFuel.includes("petrol") || carFuel.includes("gasoline") || carFuel.includes("v6") || carFuel.includes("v8");
        return carFuel.includes(fuel);
      });
    }

    // Body Type (Sedan, SUV, Crossover, Hatchback, Coupe, Pickup, MPV/Minivan, Bus)
    if (filters.bodyType) {
      const bt = filters.bodyType.toLowerCase();
      filtered = filtered.filter((car) => {
        const carBt = (car.bodyType || car.vehicleType || car.category || "").toLowerCase();
        if (bt.includes("mpv") || bt.includes("minivan")) {
          return carBt.includes("mpv") || carBt.includes("minivan") || carBt.includes("van");
        }
        return carBt.includes(bt) || bt.includes(carBt);
      });
    }

    // Drive Type (FWD, RWD, AWD / 4WD)
    if (filters.driveType) {
      const dt = filters.driveType.toLowerCase();
      filtered = filtered.filter((car) => {
        const carDt = (car.driveType || "").toLowerCase();
        if (dt.includes("awd") || dt.includes("4wd")) {
          return carDt.includes("awd") || carDt.includes("4wd") || carDt.includes("all");
        }
        if (dt.includes("fwd")) return carDt.includes("fwd") || carDt.includes("front");
        if (dt.includes("rwd")) return carDt.includes("rwd") || carDt.includes("rear");
        return carDt.includes(dt);
      });
    }

    // Seating Capacity
    if (filters.seatingCapacity) {
      const seatsCount = filters.seatingCapacity.replace(/\D/g, "");
      filtered = filtered.filter((car) => {
        if (car.seatingCapacity === undefined || car.seatingCapacity === null) return true;
        return String(car.seatingCapacity).includes(seatsCount);
      });
    }

    // Transmission
    if (filters.transmission) {
      const trans = filters.transmission.toLowerCase();
      filtered = filtered.filter((car) => {
        const carTrans = (car.transmission || car.keySpec || "").toLowerCase();
        return carTrans.includes(trans) || trans.includes(carTrans);
      });
    }

    // EV Range
    if (filters.evRange) {
      const minKm = parseInt(filters.evRange.replace(/\D/g, ""), 10) || 0;
      filtered = filtered.filter((car) => {
        if (!car.evRange) return false;
        const rangeNum =
          typeof car.evRange === "number"
            ? car.evRange
            : parseInt(String(car.evRange).replace(/\D/g, ""), 10) || 0;
        return rangeNum >= minKm;
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

    // Sort order
    if (sort === "price-desc") {
      return [...filtered].sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [cars, activeFilter, filters, sort]);

  const alternatives = useMemo(() => {
    const queryWords = filters.query.toLowerCase().split(/\s+/).filter(Boolean);

    return [...cars]
      .map((car) => {
        const details = `${car.brand} ${car.model} ${car.bodyType} ${car.vehicleType} ${car.fuelType} ${car.powertrain}`.toLowerCase();
        let score = 0;
        if (filters.brand && car.brand.toLowerCase() === filters.brand.toLowerCase()) score += 8;
        if (filters.bodyType && details.includes(filters.bodyType.toLowerCase())) score += 5;
        if (filters.fuelType && details.includes(filters.fuelType.toLowerCase().replace("fully ", ""))) score += 4;
        score += queryWords.filter((word) => details.includes(word)).length;
        return { car, score };
      })
      .sort((a, b) => b.score - a.score || a.car.price - b.car.price)
      .slice(0, 3)
      .map(({ car }) => car);
  }, [cars, filters]);

  return (
    <div className="space-y-8">
      {/* Top Header Controls: Quick Category Pills & Search */}
      <ScrollReveal
        className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-center"
        variant="fade-up"
      >
        <div className="flex flex-wrap gap-2.5">
          {CATEGORY_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`h-10 rounded-full px-5 text-[13px] font-bold transition-all ${
                activeFilter === filter
                  ? "bg-[#C9943A] text-black shadow-[0_4px_16px_rgba(201,148,58,0.3)]"
                  : "border border-white/8 bg-white/4 text-white/70 hover:bg-white/8 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={filters.query}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, query: event.target.value }))
            }
            placeholder="Search make, model, trim, spec..."
            className="h-12 w-full rounded-[12px] border border-white/10 bg-[#141414] pl-12 pr-4 text-sm font-semibold text-white placeholder:text-white/30 focus:border-[#C9943A]/50 focus:outline-none transition-colors"
          />
        </div>
      </ScrollReveal>

      {/* Main Content Layout with Sticky Filter Sidebar (Req 14 & Req 15) */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Filter Sidebar Component (Sticky on desktop, slide drawer on mobile) */}
        <VehicleFilterSidebar
          filters={filters}
          onChange={(updated) =>
            setFilters((prev) => ({ ...prev, ...updated }))
          }
          onReset={() => setFilters(INITIAL_FILTERS)}
          totalResults={results.length}
          options={backendFilterOptions ?? filterOptions}
        />

        {/* Results Area */}
        <div className="flex-1 min-w-0 w-full">
          {/* Sub-bar: Count + View Layout Switcher + Sort */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/8 pb-4">
            <p className="text-sm font-bold text-white/40">
              {isLoading ? (
                "Loading inventory…"
              ) : (
                <>
                  Showing <span className="text-white font-black">{results.length}</span>{" "}
                  vehicles
                </>
              )}
            </p>

            <div className="flex items-center gap-4">
              {/* Layout Switcher (Req 5: 1 row per vehicle OR 2 vehicles per row) */}
              <div className="flex items-center rounded-lg border border-white/8 bg-[#141414] p-1">
                <button
                  type="button"
                  onClick={() => setLayout("row")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                    layout === "row"
                      ? "bg-[#C9943A] text-black shadow-sm"
                      : "text-white/40 hover:text-white"
                  }`}
                  title="Single row per vehicle (Spacious)"
                >
                  <Rows3 className="h-3.5 w-3.5" />
                  <span>Row View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLayout("grid")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                    layout === "grid"
                      ? "bg-[#C9943A] text-black shadow-sm"
                      : "text-white/40 hover:text-white"
                  }`}
                  title="Two vehicles per row"
                >
                  <Grid2X2 className="h-3.5 w-3.5" />
                  <span>2 per Row</span>
                </button>
              </div>

              {/* Sort Dropdown */}
              <label className="flex items-center gap-2 text-xs font-semibold text-white/40">
                Sort:
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortOption)}
                  className="h-9 rounded-lg border border-white/10 bg-[#141414] px-3 text-xs font-semibold text-white focus:outline-none"
                >
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                    <option key={key} value={key} className="bg-[#141414] text-white">
                      {SORT_LABELS[key]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Listings Section */}
          {isLoading ? (
            layout === "row" ? (
              <div className="mt-8 space-y-6">
                {[1, 2, 3].map((i) => (
                  <SkeletonRowCard key={i} />
                ))}
              </div>
            ) : (
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonGridCard key={i} />
                ))}
              </div>
            )
          ) : results.length > 0 ? (
            layout === "row" ? (
              <div className="mt-8 space-y-6">
                {results.map((car, index) => (
                  <ScrollReveal key={car.id} delay={(index % 4) * 60}>
                    <CarListingCard car={car} layout="row" />
                  </ScrollReveal>
                ))}
              </div>
            ) : (
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {results.map((car, index) => (
                  <ScrollReveal key={car.id} delay={(index % 2) * 80}>
                    <CarListingCard car={car} layout="grid" />
                  </ScrollReveal>
                ))}
              </div>
            )
          ) : (
            <div className="mt-8 space-y-6">
              <ScrollReveal className="rounded-2xl border border-[#C9943A]/25 bg-[#C9943A]/[0.06] px-6 py-10 text-center">
                <p className="text-base font-black text-white">Nothing found within your selected criteria.</p>
                <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-relaxed text-white/50">
                  We&apos;ve kept your search open and selected nearby alternatives with similar make, body type, powertrain or specifications.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFilters(INITIAL_FILTERS);
                    setActiveFilter("All");
                  }}
                  className="mt-5 inline-flex items-center rounded-lg bg-[#C9943A] px-4 py-2 text-xs font-bold text-black hover:bg-[#E0AE5A]"
                >
                  Explore all vehicles
                </button>
              </ScrollReveal>

              {alternatives.length > 0 && (
                <section>
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-[#C9943A]">Closest alternatives</p>
                      <h2 className="mt-1 text-xl font-black text-white">You may also like</h2>
                    </div>
                    <span className="text-xs text-white/40">Based on your search and vehicle specifications</span>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {alternatives.map((car) => <CarListingCard key={car.id} car={car} layout="grid" />)}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
