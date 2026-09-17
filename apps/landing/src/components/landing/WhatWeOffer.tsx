import { BadgeCheck, ShieldCheck, UsersRound } from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function WhatWeOffer() {
  return (
    <section id="about" className="bg-[#242424] px-6 py-24 lg:px-16">
      {/* Subtle divider glow */}
      <div className="mx-auto mb-16 h-px max-w-7xl bg-gradient-to-r from-transparent via-[#C9943A]/30 to-transparent" />

      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <ScrollReveal className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#343434]">
          <ImagePlaceholder
            label="autoSecure Mobility team and vehicles"
            className="h-[380px] w-full"
            src="/images/cars/featured-car.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-7 sm:p-9">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#C9943A]">
              Built for confident decisions
            </p>
            <p className="mt-2 max-w-sm text-lg font-black leading-snug text-white">
              A clearer, more trustworthy way to discover your next vehicle.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <span className="inline-flex items-center rounded-full border border-[#C9943A]/20 bg-[#C9943A]/10 px-4 py-1.5 text-xs font-bold text-[#C9943A]">
            About autoSecure Mobility
          </span>
          <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Your trusted partner for <span className="text-[#C9943A]">smarter mobility.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/50">
            autoSecure Mobility brings vehicle discovery, trusted suppliers and clear decision-making tools into one dependable experience. We help customers explore confidently, compare what matters and connect with the right vehicle for their needs.
          </p>

          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
              <ShieldCheck className="h-5 w-5 text-[#C9943A]" />
              <h3 className="mt-4 text-sm font-black text-white">Trust first</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/45">We put transparency and confidence at the heart of every step.</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
              <BadgeCheck className="h-5 w-5 text-[#C9943A]" />
              <h3 className="mt-4 text-sm font-black text-white">Clear choices</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/45">Useful details and comparisons, not just a list of vehicles.</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
              <UsersRound className="h-5 w-5 text-[#C9943A]" />
              <h3 className="mt-4 text-sm font-black text-white">Customer-led</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/45">Tools designed around real needs, budgets and daily journeys.</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
