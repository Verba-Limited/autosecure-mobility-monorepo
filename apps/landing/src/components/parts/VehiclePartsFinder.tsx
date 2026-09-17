"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Search, Send, Wrench } from "lucide-react";
import { PART_CATEGORIES, type PartCategory } from "@/data/parts";
import { addCustomerRequest, getCustomerEmail } from "@/lib/auth-api";

const VEHICLE_TYPES = ["Passenger car", "SUV", "Pickup", "Van / Commercial"];
const BRANDS = ["BMW", "Mercedes-Benz", "Toyota", "Honda", "Hyundai", "Lexus", "Land Rover", "Volkswagen", "Other"];
const MODEL_HINTS: Record<string, string[]> = {
  BMW: ["3 Series", "5 Series", "X3", "X5"],
  "Mercedes-Benz": ["C-Class", "E-Class", "GLC", "GLE"],
  Toyota: ["Camry", "Corolla", "Highlander", "Land Cruiser"],
  Honda: ["Accord", "Civic", "CR-V"],
  Hyundai: ["Elantra", "Sonata", "Tucson", "Santa Fe"],
  Lexus: ["ES", "RX", "GX", "LX"],
  "Land Rover": ["Range Rover", "Discovery", "Defender"],
  Volkswagen: ["Golf", "Passat", "Tiguan"],
};

type FinderValues = { vehicleType: string; brand: string; model: string; trim: string; part: string };

const EMPTY_VALUES: FinderValues = { vehicleType: "", brand: "", model: "", trim: "", part: "" };

export function VehiclePartsFinder({ onSearch }: { onSearch: (part: string) => void }) {
  const [values, setValues] = useState<FinderValues>(EMPTY_VALUES);
  const [message, setMessage] = useState("");
  const models = MODEL_HINTS[values.brand] ?? [];

  function update(key: keyof FinderValues, value: string) {
    setValues((current) => ({ ...current, [key]: value, ...(key === "brand" ? { model: "" } : {}) }));
    setMessage("");
  }

  function searchParts(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.part) return;
    onSearch(values.part);
    setMessage("Showing the closest matching parts below. Confirm fitment before ordering.");
  }

  function requestQuote() {
    if (!values.vehicleType || !values.brand || !values.model || !values.part) {
      setMessage("Select your vehicle type, brand, model and required part before requesting a quote.");
      return;
    }
    if (!getCustomerEmail()) {
      window.location.assign("/login?next=/parts");
      return;
    }
    addCustomerRequest({
      requestType: "Auto Part Sourcing",
      vehicleOrItem: `${values.brand} ${values.model}${values.trim ? ` ${values.trim}` : ""} — ${values.part}`,
      notes: `Vehicle type: ${values.vehicleType}. Fitment request submitted from the Parts Finder.`,
    });
    window.location.assign("/account");
  }

  return (
    <section className="mb-10 overflow-hidden rounded-2xl border border-amber-400/20 bg-gradient-to-r from-[#181208] via-[#12100b] to-[#0d0d0d] p-5 sm:p-7">
      <div className="flex flex-col gap-3 border-b border-white/8 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400"><Wrench className="h-4 w-4" /> Find parts that fit</span>
          <h2 className="mt-2 text-xl font-black text-white">Tell us about your vehicle. We&apos;ll narrow the search.</h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-white/50">Choose your vehicle and the part you need instead of working through complex fitment specifications yourself.</p>
        </div>
        <button type="button" onClick={requestQuote} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-amber-400/35 bg-amber-400/10 px-4 text-xs font-black text-amber-400 hover:bg-amber-400/20">
          <Send className="h-3.5 w-3.5" /> Request a quote
        </button>
      </div>

      <form onSubmit={searchParts} className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Select label="Vehicle type" value={values.vehicleType} onChange={(value) => update("vehicleType", value)} options={VEHICLE_TYPES} />
        <Select label="Manufacturer / brand" value={values.brand} onChange={(value) => update("brand", value)} options={BRANDS} />
        <Select label="Model" value={values.model} onChange={(value) => update("model", value)} options={models} disabled={!values.brand} allowCustom />
        <label className="block"><span className="mb-1 block text-[11px] font-bold text-white/55">Trim (if applicable)</span><input value={values.trim} onChange={(event) => update("trim", event.target.value)} placeholder="e.g. XLE, M Sport" className="h-10 w-full rounded-lg border border-white/10 bg-black/25 px-3 text-xs font-semibold text-white placeholder:text-white/25 outline-none focus:border-amber-400/60" /></label>
        <Select label="Part required" value={values.part} onChange={(value) => update("part", value)} options={PART_CATEGORIES.filter((part) => part !== "All Parts") as PartCategory[]} />
        <button type="submit" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 text-xs font-black text-black hover:bg-amber-300 sm:col-span-2 lg:col-span-5"><Search className="h-4 w-4" /> Find matching parts</button>
      </form>

      {message && <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-amber-200"><CheckCircle2 className="h-4 w-4 shrink-0 text-amber-400" />{message}</p>}
    </section>
  );
}

function Select({ label, value, onChange, options, disabled, allowCustom }: { label: string; value: string; onChange: (value: string) => void; options: readonly string[]; disabled?: boolean; allowCustom?: boolean }) {
  return <label className="block"><span className="mb-1 block text-[11px] font-bold text-white/55">{label}</span><select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-lg border border-white/10 bg-[#161616] px-3 text-xs font-semibold text-white outline-none focus:border-amber-400/60 disabled:cursor-not-allowed disabled:opacity-40"><option value="">Select {label.toLowerCase()}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}{allowCustom && <option value="Other">Other / enter in quote request</option>}</select></label>;
}
