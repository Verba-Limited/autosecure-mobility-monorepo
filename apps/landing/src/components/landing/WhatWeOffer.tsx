import { ArrowRight, Tag, Wrench } from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function WhatWeOffer() {
  return (
    <section className="bg-white px-6 py-24 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-cream-100 px-4 py-1.5 text-xs font-bold text-gold-600">
            What We Offer
          </span>
          <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-navy-900 sm:text-5xl">
            Everything Automotive.
            <br />
            <span className="text-gold-500">One Platform.</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-navy-900/55">
            From factory-fresh vehicles to certified pre-owned deals and <br />{" "}
            premium parts - all trusted, all verified.
          </p>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          <ScrollReveal
            className="overflow-hidden rounded-[22px] border border-[#D9E2EF] bg-white shadow-[0_18px_45px_rgba(28,43,74,0.06)]"
            delay={80}
          >
            <ImagePlaceholder
              label="New vehicle lineup"
              className="h-[188px] w-full "
              src="/images/cars/vehicle1.svg"
            />
            <div className="p-7">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#1C2B4A]">
                New Vehicles
              </p>
              <h3 className="mt-3 text-[20px] font-black leading-tight text-[#1C2B4A]">
                Brand-New Cars
              </h3>
              <p className="mt-3 text-[13px] font-medium leading-[1.85] text-[#4D5F7C]">
                Factory-fresh vehicles from top global manufacturers. Full
                specs, video walkthroughs, and flexible pricing - outright,
                finance, or lease.
              </p>
              <a
                href="#new-cars"
                className="mt-7 flex items-center justify-between text-[12px] font-black text-[#1C2B4A]"
              >
                250+ models available
                <ArrowRight className="h-3.5 w-3.5 text-[#C9943A]" />
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal
            className="overflow-hidden rounded-[22px] border border-[#E8C887] bg-white shadow-[0_18px_45px_rgba(28,43,74,0.06)]"
            delay={180}
          >
            <div className="relative flex h-[188px] items-center justify-center bg-[#1C2B4A]">
              <Tag
                className="h-20 w-20 fill-[#FFD19A] text-[#FFD19A]"
                strokeWidth={1.6}
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-[#C9943A] px-6 py-2">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white">
                  Flash Sale on Now
                </span>
                <span className="text-[10px] font-black text-white">
                  Up to 25% Off
                </span>
              </div>
            </div>
            <div className="p-7">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#C9943A]">
                Certified Pre-Owned
              </p>
              <h3 className="mt-3 text-[20px] font-black leading-tight text-[#1C2B4A]">
                Used Cars &amp; Deals
              </h3>
              <p className="mt-3 text-[13px] font-medium leading-[1.85] text-[#4D5F7C]">
                Certified pre-owned vehicles with verified mileage, condition
                inspection reports, and exclusive deals updated weekly.
              </p>
              <a
                href="#used-cars"
                className="mt-7 flex items-center justify-between text-[12px] font-black text-[#C9943A]"
              >
                180+ verified listings
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal
            className="overflow-hidden rounded-[22px] border border-[#E8E0D0] bg-white shadow-[0_18px_45px_rgba(28,43,74,0.06)]"
            delay={280}
          >
            <div className="flex h-[188px] items-center justify-center bg-[#FFF2D8]">
              <Wrench
                className="h-[78px] w-[78px] rotate-[-25deg] text-[#1C2B4A]"
                strokeWidth={1.75}
              />
            </div>
            <div className="p-7">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#C9943A]">
                OEM &amp; Performance
              </p>
              <h3 className="mt-3 text-[20px] font-black leading-tight text-[#1C2B4A]">
                Aftermarket Parts
              </h3>
              <p className="mt-3 text-[13px] font-medium leading-[1.85] text-[#4D5F7C]">
                1,200+ performance and OEM-spec parts. Choose next-day,
                standard, or economy delivery - prices update instantly when you
                switch.
              </p>
              <a
                href="#parts"
                className="mt-7 flex items-center justify-between text-[12px] font-black text-[#C9943A]"
              >
                1,200+ parts in stock
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
