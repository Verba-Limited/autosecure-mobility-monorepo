"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Check,
  Lock,
  MessageCircle,
  Plus,
  Scale,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import type { Car } from "@/data/cars";
import { fetchNewCars } from "@/lib/catalog-api";
import { getCustomerEmail } from "@/lib/auth-api";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { formatVehiclePriceRange } from "@/lib/pricing-utils";

export function VehicleCompareClient() {
  const searchParams = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isInventoryLoading, setIsInventoryLoading] = useState(true);
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setIsLoggedIn(Boolean(getCustomerEmail()));

    // Pre-populate from query params if given
    const v1 = searchParams.get("v1");
    const v2 = searchParams.get("v2");
    async function load() {
      try {
        const fetched = await fetchNewCars();
        if (fetched.length > 0) {
          setAllCars(fetched);
          setSelectedIds(
            [v1, v2].filter((id): id is string => Boolean(id && fetched.some((car) => car.id === id))).length
              ? [v1, v2].filter((id): id is string => Boolean(id && fetched.some((car) => car.id === id)))
              : fetched.slice(0, 2).map((car) => car.id),
          );
        }
      } catch {
        setAllCars([]);
      } finally {
        setIsInventoryLoading(false);
      }
    }
    load();
  }, [searchParams]);

  // Loading state while checking auth
  if (isLoggedIn === null) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#C9943A] border-t-transparent" />
      </div>
    );
  }

  // Gated: Customer NOT logged in
  if (!isLoggedIn) {
    return (
      <div className="py-8">
        <ScrollReveal
          className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-[#C9943A]/25 bg-gradient-to-b from-[#131109] via-[#0d0d0d] to-black p-8 sm:p-14 text-center shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
          variant="fade-up"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#C9943A]/30 bg-[#C9943A]/10 text-[#C9943A] shadow-[0_0_30px_rgba(201,148,58,0.2)]">
            <Lock className="h-9 w-9" />
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-[#C9943A]/30 bg-[#C9943A]/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#C9943A]">
            <Scale className="h-3.5 w-3.5" />
            Comparison Tool Gated
          </span>

          <h1 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-5xl">
            Compare Vehicles <span className="text-[#C9943A]">Side-by-Side</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base font-normal leading-relaxed text-white/60 sm:text-lg">
            Authentication is required before comparing vehicles. Log in or create an account to unlock side-by-side technical specifications, acceleration metrics, protected pricing, and feature comparisons.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login?next=/compare"
              className="flex h-12 w-full items-center justify-center rounded-xl bg-[#C9943A] px-8 text-sm font-black text-black transition-all hover:bg-[#E0AE5A] shadow-[0_4px_20px_rgba(201,148,58,0.3)] sm:w-auto"
            >
              Sign in to Compare
            </Link>
            <Link
              href="/register?next=/compare"
              className="flex h-12 w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-8 text-sm font-bold text-white transition-all hover:bg-white/10 hover:border-white/30 sm:w-auto"
            >
              Create Free Account
            </Link>
          </div>

          {/* Comparison Preview Highlights */}
          <div className="mt-14 grid gap-4 border-t border-white/8 pt-10 sm:grid-cols-3 text-left">
            <div className="rounded-2xl border border-white/6 bg-white/3 p-5">
              <Zap className="h-5 w-5 text-[#C9943A]" />
              <h3 className="mt-3 text-sm font-bold text-white">Performance</h3>
              <p className="mt-1 text-xs text-white/50 leading-relaxed">
                Compare horsepower, 0-100 km/h, top speed, and powertrain efficiency across models.
              </p>
            </div>
            <div className="rounded-2xl border border-white/6 bg-white/3 p-5">
              <Scale className="h-5 w-5 text-[#C9943A]" />
              <h3 className="mt-3 text-sm font-bold text-white">Specs &amp; Dimensions</h3>
              <p className="mt-1 text-xs text-white/50 leading-relaxed">
                Review seating capacity, transmission types, drive systems, and body dimensions.
              </p>
            </div>
            <div className="rounded-2xl border border-white/6 bg-white/3 p-5">
              <Sparkles className="h-5 w-5 text-[#C9943A]" />
              <h3 className="mt-3 text-sm font-bold text-white">Unlocked Pricing</h3>
              <p className="mt-1 text-xs text-white/50 leading-relaxed">
                View verified price ranges, monthly financing estimates, and available promotions.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  // Active Comparison Tool (User IS Logged In)
  const comparedCars = selectedIds
    .map((id) => allCars.find((c) => c.id === id))
    .filter((c): c is Car => Boolean(c));

  if (isInventoryLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#C9943A] border-t-transparent" />
      </div>
    );
  }

  if (allCars.length === 0) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-black text-white">No live vehicles available to compare</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/55">
          Vehicle comparison uses the current authenticated catalogue. Please try again shortly.
        </p>
      </div>
    );
  }

  function setVehicleAtSlot(index: number, carId: string) {
    setSelectedIds((prev) => {
      const next = [...prev];
      next[index] = carId;
      return next;
    });
  }

  function addSlot() {
    if (selectedIds.length >= 4) return;
    const available = allCars.find((c) => !selectedIds.includes(c.id));
    if (available) {
      setSelectedIds((prev) => [...prev, available.id]);
    }
  }

  function removeSlot(index: number) {
    if (selectedIds.length <= 2) return;
    setSelectedIds((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/8 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C9943A]">
            <Scale className="h-3.5 w-3.5" />
            Comparison Matrix
          </span>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Compare Vehicles
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Compare up to 4 models side-by-side to make your buying decision with confidence.
          </p>
        </div>

        {selectedIds.length < 4 && (
          <button
            type="button"
            onClick={addSlot}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#C9943A]/30 bg-[#C9943A]/10 px-4 text-xs font-bold text-[#C9943A] hover:bg-[#C9943A]/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Another Vehicle
          </button>
        )}
      </div>

      {/* Comparison Grid */}
      <div className="mt-8 overflow-x-auto">
        <div className="min-w-[760px]">
          {/* Vehicle Cards Selector Row */}
          <div
            className="grid gap-6 border-b border-white/8 pb-8"
            style={{
              gridTemplateColumns: `repeat(${comparedCars.length}, minmax(0, 1fr))`,
            }}
          >
            {comparedCars.map((car, index) => (
              <div
                key={car.id + index}
                className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/8 bg-[#0d0d0d] p-5 shadow-lg"
              >
                {selectedIds.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeSlot(index)}
                    className="absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white/50 hover:text-white border border-white/10"
                    title="Remove from comparison"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}

                <div>
                  {/* Selector Dropdown */}
                  <label className="block mb-3 text-[11px] font-bold uppercase text-white/40">
                    Select Vehicle {index + 1}
                    <select
                      value={car.id}
                      onChange={(e) => setVehicleAtSlot(index, e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-white/10 bg-[#141414] px-3 py-2 text-xs font-bold text-white focus:border-[#C9943A] focus:outline-none"
                    >
                      {allCars.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#141414] text-white">
                          {c.brand} {c.model} ({c.year ?? "2025"})
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#111]">
                    <Image
                      src={car.image}
                      alt={`${car.brand} ${car.model}`}
                      fill
                      className="object-cover"
                      sizes="350px"
                    />
                    <span className="absolute left-3 top-3 rounded-full border border-[#C9943A]/30 bg-black/75 px-2.5 py-1 text-[10px] font-black uppercase text-[#C9943A]">
                      {car.badgeLabel || "New"}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-black text-white">
                    {car.brand} {car.model}
                  </h3>
                  <p className="mt-0.5 text-xs font-semibold text-white/40">
                    {car.vehicleType ?? car.category} · {car.year ?? "2025"}
                  </p>

                  <p className="mt-3 text-xl font-black text-[#C9943A]">
                    {formatVehiclePriceRange(car)}
                  </p>
                  <p className="text-[10px] text-white/40">
                    Est. range (trim &amp; duty dependent)
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Link
                    href={`/new-cars/${car.id}`}
                    className="flex h-9 items-center justify-center rounded-lg border border-[#C9943A]/30 bg-[#C9943A]/10 text-xs font-bold text-[#C9943A] hover:bg-[#C9943A]/20"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Hi, I'm inquiring about the ${car.brand} ${car.model} on autoSecure Mobility.`,
                    )}`}
                    target="_blank"
                    className="flex h-9 items-center justify-center gap-1 rounded-lg bg-[#25D366] text-xs font-bold text-black hover:bg-[#20BD5A]"
                  >
                    <MessageCircle className="h-3 w-3" fill="currentColor" />
                    WhatsApp
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Rows */}
          <div className="mt-6 space-y-6">
            {/* Section: Specifications */}
            <div>
              <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-[#C9943A]">
                Comprehensive Specifications
              </h4>
              <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] divide-y divide-white/6 overflow-hidden">
                {[
                  {
                    label: "Price Range",
                    getVal: (c: Car) => formatVehiclePriceRange(c),
                  },
                  {
                    label: "Body Type",
                    getVal: (c: Car) => c.bodyType || c.vehicleType || c.category || "N/A",
                  },
                  {
                    label: "Fuel / Powertrain",
                    getVal: (c: Car) => c.fuelType || c.powertrain || "N/A",
                  },
                  {
                    label: "Drive Type",
                    getVal: (c: Car) => c.driveType || "AWD / 4WD",
                  },
                  {
                    label: "Seating Capacity",
                    getVal: (c: Car) => c.seatingCapacity || "5 Seats",
                  },
                  {
                    label: "Transmission",
                    getVal: (c: Car) => c.transmission || c.keySpec || "Automatic",
                  },
                  {
                    label: "EV Range",
                    getVal: (c: Car) => c.evRange || "N/A",
                  },
                  {
                    label: "Country of Origin",
                    getVal: (c: Car) => c.countryOfOrigin || "N/A",
                  },
                  {
                    label: "Year",
                    getVal: (c: Car) => String(c.year ?? 2025),
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="grid items-center p-4 text-sm"
                    style={{
                      gridTemplateColumns: `180px repeat(${comparedCars.length}, minmax(0, 1fr))`,
                    }}
                  >
                    <span className="font-semibold text-white/40">{row.label}</span>
                    {comparedCars.map((car, idx) => (
                      <span key={car.id + idx} className="font-bold text-white pr-4">
                        {row.getVal(car)}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Available Colors */}
            <div>
              <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-[#C9943A]">
                Available Colours
              </h4>
              <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-4">
                <div
                  className="grid items-center text-sm"
                  style={{
                    gridTemplateColumns: `180px repeat(${comparedCars.length}, minmax(0, 1fr))`,
                  }}
                >
                  <span className="font-semibold text-white/40">Colours</span>
                  {comparedCars.map((car, idx) => (
                    <div key={car.id + idx} className="flex flex-wrap gap-1.5">
                      {car.colors && car.colors.length > 0 ? (
                        car.colors.map((color) => (
                          <span
                            key={color.name}
                            title={color.name}
                            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/80"
                          >
                            <span
                              className="h-2.5 w-2.5 rounded-full border border-white/30"
                              style={{ backgroundColor: color.hex }}
                            />
                            {color.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-white/40 text-xs">Standard palette</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section: Features Checklist */}
            <div>
              <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-[#C9943A]">
                Standard Equipment
              </h4>
              <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] divide-y divide-white/6 overflow-hidden">
                {[
                  "Factory Warranty",
                  "Panoramic Sunroof",
                  "Navigation System",
                  "Bluetooth & Smartphone Integration",
                  "Blind Spot Monitoring",
                  "Parking Sensors & 360° Camera",
                ].map((feature) => (
                  <div
                    key={feature}
                    className="grid items-center p-4 text-sm"
                    style={{
                      gridTemplateColumns: `180px repeat(${comparedCars.length}, minmax(0, 1fr))`,
                    }}
                  >
                    <span className="font-semibold text-white/40">{feature}</span>
                    {comparedCars.map((car, idx) => (
                      <span key={car.id + idx} className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <Check className="h-4 w-4 stroke-[3]" />
                        Included
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
