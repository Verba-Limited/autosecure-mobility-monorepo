"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

export type VehicleFilterValues = {
  query: string;
  brand: string;
  model: string;
  priceRangeKey: string;
  year: string;
  color: string;
  fuelType: string;
  bodyType: string;
  driveType: string;
  seatingCapacity: string;
  transmission: string;
  evRange: string;
  countryOfOrigin: string;
};

export type VehicleFilterOptions = Partial<{
  brands: string[];
  years: string[];
  colors: { name: string; hex: string }[];
  fuelTypes: string[];
  bodyTypes: string[];
  driveTypes: string[];
  seatingOptions: string[];
  transmissions: string[];
  countries: string[];
}>;

export const INITIAL_FILTERS: VehicleFilterValues = {
  query: "",
  brand: "",
  model: "",
  priceRangeKey: "all",
  year: "",
  color: "",
  fuelType: "",
  bodyType: "",
  driveType: "",
  seatingCapacity: "",
  transmission: "",
  evRange: "",
  countryOfOrigin: "",
};

const BRANDS = [
  "Toyota",
  "BMW",
  "Mercedes-Benz",
  "Land Rover",
  "Porsche",
  "Tesla",
  "Lexus",
  "Volkswagen",
  "Volvo",
  "Ford",
  "Honda",
];

const PRICE_RANGES = [
  { key: "all", label: "All Price Ranges" },
  { key: "under-35", label: "Under ₦35 million" },
  { key: "35-65", label: "₦35 million – ₦65 million" },
  { key: "65-100", label: "₦65 million – ₦100 million" },
  { key: "above-100", label: "Above ₦100 million" },
];

const YEARS = ["2026", "2025", "2024", "2023", "2022", "2021", "2020"];

const COLORS = [
  { name: "Black", hex: "#0f0f10" },
  { name: "White", hex: "#f8f9fa" },
  { name: "Grey / Silver", hex: "#7a8288" },
  { name: "Blue", hex: "#1e3a5f" },
  { name: "Red", hex: "#9b111e" },
  { name: "Green", hex: "#173b2d" },
];

const FUEL_TYPES = [
  "Petrol",
  "Diesel",
  "Hybrid",
  "Plug-in Hybrid",
  "Fully Electric (EV)",
];

const BODY_TYPES = [
  "Sedan",
  "SUV",
  "Crossover",
  "Hatchback",
  "Coupe",
  "Pickup",
  "MPV/Minivan",
  "Bus",
];

const DRIVE_TYPES = ["FWD", "RWD", "AWD / 4WD"];

const SEATING_OPTIONS = ["2 Seats", "4 Seats", "5 Seats", "7 Seats", "8+ Seats"];

const TRANSMISSIONS = ["Automatic", "Manual", "Dual-Clutch / PDK"];

const EV_RANGES = ["300+ km", "450+ km", "600+ km"];

const COUNTRIES = [
  "Germany",
  "Japan",
  "USA",
  "United Kingdom",
  "Sweden",
  "South Korea",
];

export function VehicleFilterSidebar({
  filters,
  onChange,
  onReset,
  totalResults,
  options,
}: {
  filters: VehicleFilterValues;
  onChange: (updated: Partial<VehicleFilterValues>) => void;
  onReset: () => void;
  totalResults: number;
  options?: VehicleFilterOptions;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Accordion toggle states
  const [expanded, setExpanded] = useState({
    basic: true,
    price: true,
    fuel: true,
    body: true,
    drive: true,
    specs: true,
  });

  const toggle = (section: keyof typeof expanded) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Count active filters
  const activeCount = Object.entries(filters).filter(
    ([k, v]) => k !== "priceRangeKey" ? Boolean(v) : v !== "all",
  ).length;

  const content = (
    <div className="space-y-6">
      {/* Search Input */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2">
          Vehicle Search
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => onChange({ query: e.target.value })}
            placeholder="Brand, model, keyword..."
            className="h-10 w-full rounded-xl border border-white/10 bg-[#141414] pl-10 pr-4 text-xs font-semibold text-white placeholder:text-white/30 focus:border-[#C9943A] focus:outline-none transition-colors"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => onChange({ query: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Summary Chips */}
      {activeCount > 0 && (
        <div className="rounded-xl border border-white/8 bg-white/3 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#C9943A]">
              {activeCount} Active Filter{activeCount > 1 ? "s" : ""}
            </span>
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 text-[11px] font-semibold text-white/40 hover:text-white transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Reset All
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filters.brand && (
              <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/6 px-2 py-0.5 text-[11px] text-white">
                {filters.brand}
                <button type="button" onClick={() => onChange({ brand: "" })}>
                  <X className="h-2.5 w-2.5 text-white/50 hover:text-white" />
                </button>
              </span>
            )}
            {filters.bodyType && (
              <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/6 px-2 py-0.5 text-[11px] text-white">
                {filters.bodyType}
                <button type="button" onClick={() => onChange({ bodyType: "" })}>
                  <X className="h-2.5 w-2.5 text-white/50 hover:text-white" />
                </button>
              </span>
            )}
            {filters.fuelType && (
              <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/6 px-2 py-0.5 text-[11px] text-white">
                {filters.fuelType}
                <button type="button" onClick={() => onChange({ fuelType: "" })}>
                  <X className="h-2.5 w-2.5 text-white/50 hover:text-white" />
                </button>
              </span>
            )}
            {filters.driveType && (
              <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/6 px-2 py-0.5 text-[11px] text-white">
                {filters.driveType}
                <button type="button" onClick={() => onChange({ driveType: "" })}>
                  <X className="h-2.5 w-2.5 text-white/50 hover:text-white" />
                </button>
              </span>
            )}
            {filters.year && (
              <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/6 px-2 py-0.5 text-[11px] text-white">
                {filters.year}
                <button type="button" onClick={() => onChange({ year: "" })}>
                  <X className="h-2.5 w-2.5 text-white/50 hover:text-white" />
                </button>
              </span>
            )}
            {filters.priceRangeKey !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-md border border-[#C9943A]/30 bg-[#C9943A]/10 px-2 py-0.5 text-[11px] text-[#C9943A]">
                {PRICE_RANGES.find((p) => p.key === filters.priceRangeKey)?.label}
                <button type="button" onClick={() => onChange({ priceRangeKey: "all" })}>
                  <X className="h-2.5 w-2.5 text-[#C9943A]/60 hover:text-[#C9943A]" />
                </button>
              </span>
            )}
            {filters.color && (
              <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/6 px-2 py-0.5 text-[11px] text-white">
                {filters.color}
                <button type="button" onClick={() => onChange({ color: "" })}>
                  <X className="h-2.5 w-2.5 text-white/50 hover:text-white" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Section 1: Manufacturer / Brand */}
      <div className="border-t border-white/8 pt-4">
        <button
          type="button"
          onClick={() => toggle("basic")}
          className="flex w-full items-center justify-between text-xs font-black uppercase tracking-wider text-white hover:text-[#C9943A]"
        >
          <span>Manufacturer / Brand</span>
          {expanded.basic ? (
            <ChevronUp className="h-4 w-4 text-white/40" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white/40" />
          )}
        </button>

        {expanded.basic && (
          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => onChange({ brand: "" })}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  !filters.brand
                    ? "bg-[#C9943A] text-black font-bold"
                    : "border border-white/8 bg-white/3 text-white/60 hover:text-white hover:bg-white/6"
                }`}
              >
                All
              </button>
              {(options?.brands?.length ? options.brands : BRANDS).map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => onChange({ brand: filters.brand === brand ? "" : brand })}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    filters.brand === brand
                      ? "bg-[#C9943A] text-black font-bold"
                      : "border border-white/8 bg-white/3 text-white/60 hover:text-white hover:bg-white/6"
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>

            {/* Model text filter */}
            <div className="mt-2">
              <input
                type="text"
                value={filters.model}
                onChange={(e) => onChange({ model: e.target.value })}
                placeholder="Specific model (e.g. 530i, X5, Camry)..."
                className="h-9 w-full rounded-lg border border-white/10 bg-[#141414] px-3 text-xs text-white placeholder:text-white/30 focus:border-[#C9943A] focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Price Range */}
      <div className="border-t border-white/8 pt-4">
        <button
          type="button"
          onClick={() => toggle("price")}
          className="flex w-full items-center justify-between text-xs font-black uppercase tracking-wider text-white hover:text-[#C9943A]"
        >
          <span>Price Range</span>
          {expanded.price ? (
            <ChevronUp className="h-4 w-4 text-white/40" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white/40" />
          )}
        </button>

        {expanded.price && (
          <div className="mt-3 space-y-1.5">
            {PRICE_RANGES.map((range) => (
              <label
                key={range.key}
                className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                  filters.priceRangeKey === range.key
                    ? "bg-[#C9943A]/10 text-[#C9943A] font-bold border border-[#C9943A]/30"
                    : "text-white/70 hover:bg-white/4 hover:text-white"
                }`}
              >
                <span>{range.label}</span>
                <input
                  type="radio"
                  name="priceRange"
                  checked={filters.priceRangeKey === range.key}
                  onChange={() => onChange({ priceRangeKey: range.key })}
                  className="sr-only"
                />
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Year & Colour */}
      <div className="border-t border-white/8 pt-4">
        <div className="space-y-4">
          <div>
            <span className="block text-xs font-black uppercase tracking-wider text-white mb-2">
              Model Year
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onChange({ year: "" })}
                className={`rounded-lg px-2 py-1 text-xs transition-all ${
                  !filters.year
                    ? "bg-[#C9943A] text-black font-bold"
                    : "border border-white/8 bg-white/3 text-white/60 hover:text-white"
                }`}
              >
                Any
              </button>
              {(options?.years?.length ? options.years : YEARS).map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => onChange({ year: filters.year === yr ? "" : yr })}
                  className={`rounded-lg px-2 py-1 text-xs transition-all ${
                    filters.year === yr
                      ? "bg-[#C9943A] text-black font-bold"
                      : "border border-white/8 bg-white/3 text-white/60 hover:text-white"
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-xs font-black uppercase tracking-wider text-white mb-2">
              Colour
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(options?.colors?.length ? options.colors : COLORS).map((col) => (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => onChange({ color: filters.color === col.name ? "" : col.name })}
                  title={col.name}
                  className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition-all ${
                    filters.color === col.name
                      ? "border-[#C9943A] bg-[#C9943A]/10 text-white font-bold ring-1 ring-[#C9943A]"
                      : "border-white/8 bg-white/3 text-white/60 hover:text-white"
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full border border-white/30"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span>{col.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Fuel / Powertrain */}
      <div className="border-t border-white/8 pt-4">
        <button
          type="button"
          onClick={() => toggle("fuel")}
          className="flex w-full items-center justify-between text-xs font-black uppercase tracking-wider text-white hover:text-[#C9943A]"
        >
          <span>Fuel / Powertrain</span>
          {expanded.fuel ? (
            <ChevronUp className="h-4 w-4 text-white/40" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white/40" />
          )}
        </button>

        {expanded.fuel && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(options?.fuelTypes?.length ? options.fuelTypes : FUEL_TYPES).map((fuel) => (
              <button
                key={fuel}
                type="button"
                onClick={() => onChange({ fuelType: filters.fuelType === fuel ? "" : fuel })}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  filters.fuelType === fuel
                    ? "bg-[#C9943A] text-black font-bold"
                    : "border border-white/8 bg-white/3 text-white/60 hover:text-white"
                }`}
              >
                {fuel}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Section 5: Body Type */}
      <div className="border-t border-white/8 pt-4">
        <button
          type="button"
          onClick={() => toggle("body")}
          className="flex w-full items-center justify-between text-xs font-black uppercase tracking-wider text-white hover:text-[#C9943A]"
        >
          <span>Body Type</span>
          {expanded.body ? (
            <ChevronUp className="h-4 w-4 text-white/40" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white/40" />
          )}
        </button>

        {expanded.body && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(options?.bodyTypes?.length ? options.bodyTypes : BODY_TYPES).map((body) => (
              <button
                key={body}
                type="button"
                onClick={() => onChange({ bodyType: filters.bodyType === body ? "" : body })}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  filters.bodyType === body
                    ? "bg-[#C9943A] text-black font-bold"
                    : "border border-white/8 bg-white/3 text-white/60 hover:text-white"
                }`}
              >
                {body}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Section 6: Drive Type */}
      <div className="border-t border-white/8 pt-4">
        <button
          type="button"
          onClick={() => toggle("drive")}
          className="flex w-full items-center justify-between text-xs font-black uppercase tracking-wider text-white hover:text-[#C9943A]"
        >
          <span>Drive Type</span>
          {expanded.drive ? (
            <ChevronUp className="h-4 w-4 text-white/40" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white/40" />
          )}
        </button>

        {expanded.drive && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(options?.driveTypes?.length ? options.driveTypes : DRIVE_TYPES).map((drive) => (
              <button
                key={drive}
                type="button"
                onClick={() => onChange({ driveType: filters.driveType === drive ? "" : drive })}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  filters.driveType === drive
                    ? "bg-[#C9943A] text-black font-bold"
                    : "border border-white/8 bg-white/3 text-white/60 hover:text-white"
                }`}
              >
                {drive}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Section 7: Other Specifications */}
      <div className="border-t border-white/8 pt-4">
        <button
          type="button"
          onClick={() => toggle("specs")}
          className="flex w-full items-center justify-between text-xs font-black uppercase tracking-wider text-white hover:text-[#C9943A]"
        >
          <span>Other Specifications</span>
          {expanded.specs ? (
            <ChevronUp className="h-4 w-4 text-white/40" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white/40" />
          )}
        </button>

        {expanded.specs && (
          <div className="mt-3 space-y-4">
            {/* Seating Capacity */}
            <div>
              <span className="block text-[11px] font-bold text-white/50 mb-1.5">
                Seating Capacity
              </span>
              <div className="flex flex-wrap gap-1">
                {(options?.seatingOptions?.length ? options.seatingOptions : SEATING_OPTIONS).map((seat) => (
                  <button
                    key={seat}
                    type="button"
                    onClick={() =>
                      onChange({ seatingCapacity: filters.seatingCapacity === seat ? "" : seat })
                    }
                    className={`rounded-md px-2 py-0.5 text-[11px] transition-all ${
                      filters.seatingCapacity === seat
                        ? "bg-[#C9943A] text-black font-bold"
                        : "border border-white/8 bg-white/3 text-white/60 hover:text-white"
                    }`}
                  >
                    {seat}
                  </button>
                ))}
              </div>
            </div>

            {/* Transmission */}
            <div>
              <span className="block text-[11px] font-bold text-white/50 mb-1.5">
                Transmission
              </span>
              <div className="flex flex-wrap gap-1">
                {(options?.transmissions?.length ? options.transmissions : TRANSMISSIONS).map((trans) => (
                  <button
                    key={trans}
                    type="button"
                    onClick={() =>
                      onChange({ transmission: filters.transmission === trans ? "" : trans })
                    }
                    className={`rounded-md px-2 py-0.5 text-[11px] transition-all ${
                      filters.transmission === trans
                        ? "bg-[#C9943A] text-black font-bold"
                        : "border border-white/8 bg-white/3 text-white/60 hover:text-white"
                    }`}
                  >
                    {trans}
                  </button>
                ))}
              </div>
            </div>

            {/* EV Range */}
            <div>
              <span className="block text-[11px] font-bold text-white/50 mb-1.5">
                EV Range (for Electric/Hybrid)
              </span>
              <div className="flex flex-wrap gap-1">
                {EV_RANGES.map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => onChange({ evRange: filters.evRange === range ? "" : range })}
                    className={`rounded-md px-2 py-0.5 text-[11px] transition-all ${
                      filters.evRange === range
                        ? "bg-[#C9943A] text-black font-bold"
                        : "border border-white/8 bg-white/3 text-white/60 hover:text-white"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Country of Origin */}
            <div>
              <span className="block text-[11px] font-bold text-white/50 mb-1.5">
                Country of Origin
              </span>
              <div className="flex flex-wrap gap-1">
                {(options?.countries?.length ? options.countries : COUNTRIES).map((ctry) => (
                  <button
                    key={ctry}
                    type="button"
                    onClick={() =>
                      onChange({
                        countryOfOrigin: filters.countryOfOrigin === ctry ? "" : ctry,
                      })
                    }
                    className={`rounded-md px-2 py-0.5 text-[11px] transition-all ${
                      filters.countryOfOrigin === ctry
                        ? "bg-[#C9943A] text-black font-bold"
                        : "border border-white/8 bg-white/3 text-white/60 hover:text-white"
                    }`}
                  >
                    {ctry}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden mb-6 flex items-center justify-between rounded-xl border border-white/10 bg-[#0d0d0d] p-3.5">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 text-xs font-bold text-[#C9943A]"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters &amp; Specifications</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-[#C9943A] px-2 py-0.5 text-[10px] font-black text-black">
              {activeCount}
            </span>
          )}
        </button>
        <span className="text-xs text-white/40">{totalResults} vehicles</span>
      </div>

      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-[280px] xl:w-[300px] shrink-0">
        <div className="sticky top-24 rounded-2xl border border-white/8 bg-[#0d0d0d] p-5 shadow-xl max-h-[calc(100vh-120px)] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-white/8 pb-3 mb-4">
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
              <Filter className="h-3.5 w-3.5 text-[#C9943A]" />
              Vehicle Filters
            </span>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={onReset}
                className="text-[11px] font-semibold text-white/40 hover:text-white transition-colors"
              >
                Reset
              </button>
            )}
          </div>
          {content}
        </div>
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm lg:hidden">
          <div className="relative h-full w-full max-w-xs overflow-y-auto bg-[#0d0d0d] p-6 shadow-2xl border-l border-white/10">
            <div className="flex items-center justify-between border-b border-white/8 pb-4 mb-6">
              <span className="flex items-center gap-2 text-sm font-black uppercase text-white">
                <SlidersHorizontal className="h-4 w-4 text-[#C9943A]" />
                Refine Vehicles
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1 text-white/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {content}
            <div className="mt-8 pt-4 border-t border-white/8">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="w-full h-11 rounded-xl bg-[#C9943A] font-black text-black text-xs hover:bg-[#E0AE5A]"
              >
                Apply Filters ({totalResults} Results)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
