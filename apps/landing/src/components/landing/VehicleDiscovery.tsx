"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight, BatteryCharging, CarFront, Search, ShieldCheck, SlidersHorizontal, Sparkles } from "lucide-react";

const DISCOVERY_PATHS = [
  { label: "Pure EV", query: "electric", icon: BatteryCharging },
  { label: "Hybrid & Plug-in", query: "hybrid", icon: Sparkles },
  { label: "SUV & Big SUV", query: "suv", icon: CarFront },
  { label: "Sedan & Crossover", query: "sedan", icon: SlidersHorizontal },
];

const NEEDS = [
  ["Family car", "SUV 7 seats"],
  ["City driving", "electric compact"],
  ["Long-distance travel", "hybrid SUV"],
  ["Luxury / executive", "executive sedan"],
  ["Business", "business sedan"],
  ["Off-road", "4WD SUV"],
  ["First car", "compact automatic"],
  ["Performance", "performance"],
  ["Commercial use", "pickup"],
] as const;

function catalogueUrl(query: string) {
  return `/new-cars?q=${encodeURIComponent(query)}`;
}

export function VehicleDiscovery() {
  const [query, setQuery] = useState("");

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.location.assign(catalogueUrl(query));
  }

  return (
    <section className="bg-[#080808] px-6 py-24 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#C9943A]/25 bg-[#C9943A]/10 px-4 py-1.5 text-xs font-bold text-[#C9943A]">
              <Sparkles className="h-3.5 w-3.5" /> Smarter vehicle discovery
            </span>
            <h2 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Not sure which car <span className="text-[#C9943A]">fits your life?</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/55">
              Search by make, model, powertrain, body style or the way you plan to use your vehicle. When an exact match is unavailable, we keep the journey moving with nearby and comparable options.
            </p>

            <form onSubmit={search} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <label className="relative block flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Try “family SUV”, “BYD”, or “electric”"
                  className="h-13 w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 text-sm font-semibold text-white placeholder:text-white/35 outline-none transition-colors focus:border-[#C9943A]/60"
                />
              </label>
              <button className="inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-[#C9943A] px-6 text-sm font-black text-black transition-colors hover:bg-[#E0AE5A]" type="submit">
                Search vehicles <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {DISCOVERY_PATHS.map(({ label, query: pathQuery, icon: Icon }) => (
              <Link key={label} href={catalogueUrl(pathQuery)} className="group rounded-2xl border border-white/8 bg-white/[0.03] p-5 transition hover:-translate-y-0.5 hover:border-[#C9943A]/35 hover:bg-[#C9943A]/[0.06]">
                <Icon className="h-5 w-5 text-[#C9943A]" />
                <h3 className="mt-7 text-base font-black text-white">{label}</h3>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-white/45 group-hover:text-[#C9943A]">Explore matches <ArrowRight className="h-3.5 w-3.5" /></span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-16 border-t border-white/8 pt-12">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C9943A]">Search by your need</p>
              <h3 className="mt-3 text-2xl font-black text-white">Start with what matters to you.</h3>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-white/45">Choose a starting point, then refine by budget, powertrain, seating, transmission and other specifications.</p>
          </div>
          <div className="mt-7 flex flex-wrap gap-2.5">
            {NEEDS.map(([label, searchQuery]) => (
              <Link key={label} href={catalogueUrl(searchQuery)} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-white/65 transition hover:border-[#C9943A]/40 hover:bg-[#C9943A]/10 hover:text-white">
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-5 rounded-3xl border border-white/8 bg-gradient-to-r from-[#121008] to-[#0c0c0c] p-7 sm:grid-cols-[1fr_auto] sm:items-center sm:p-9">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#C9943A]"><ShieldCheck className="h-4 w-4" /> Make a confident choice</span>
            <h3 className="mt-3 text-2xl font-black text-white">Compare the differences that matter.</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">Signed-in customers can compare up to three vehicles side by side—price range, powertrain, EV range, seating, drive type, transmission and key features—so the better choice is easier to see.</p>
          </div>
          <Link href="/compare" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-black transition hover:bg-[#E0AE5A]">Compare vehicles <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </section>
  );
}
