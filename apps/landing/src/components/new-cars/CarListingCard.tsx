"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Play, Lock } from "lucide-react";
import type { Car } from "@/data/cars";
import { inquireVehicle, extractWhatsappLink } from "@/lib/catalog-api";
import { InquireModal } from "@/components/ui/InquireModal";
import { getCustomerEmail } from "@/lib/auth-api";
import { formatVehiclePriceRange } from "@/lib/pricing-utils";

export function CarListingCard({
  car,
  layout = "row",
}: {
  car: Car;
  layout?: "row" | "grid";
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    car.colors?.[0]?.name ?? null,
  );

  useEffect(() => {
    setIsLoggedIn(Boolean(getCustomerEmail()));
  }, []);

  const detailHref = `/new-cars/${car.id}`;

  async function handleInquire(data: {
    customerPhone: string;
    customerEmail: string;
  }) {
    setIsSubmitting(true);
    try {
      const res = await inquireVehicle(car.id, data);
      const link = extractWhatsappLink(res);
      if (link) {
        window.open(link, "_blank", "noopener,noreferrer");
      } else {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            `Hi, I'm interested in the ${car.brand} ${car.model} (${car.year ?? "New"}) listed on autoSecure Mobility.`,
          )}`,
          "_blank",
          "noopener,noreferrer",
        );
      }
      setModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Row layout (Default for Brand New Cars: 1 vehicle per row)
  if (layout === "row") {
    return (
      <>
        <article
          id={car.id}
          className="group overflow-hidden rounded-2xl border border-white/8 bg-[#0d0d0d] transition-all duration-300 hover:border-[#C9943A]/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
        >
          <div className="grid lg:grid-cols-12 items-stretch">
            {/* Image Column */}
            <div className="relative aspect-[16/10] lg:aspect-auto lg:col-span-5 min-h-[240px] lg:min-h-[290px] overflow-hidden bg-[#111]">
              <Image
                src={car.image}
                alt={car.imageLabel || `${car.brand} ${car.model}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(min-width: 1024px) 450px, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Badge */}
              <span className="absolute left-4 top-4 rounded-full border border-[#C9943A]/30 bg-black/75 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-[#C9943A] backdrop-blur-md">
                {car.badgeLabel || `New ${car.year ?? 2025}`}
              </span>

              {car.hasVideo && (
                <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/60 backdrop-blur-md">
                  <Play
                    className="h-3.5 w-3.5 text-white/80"
                    fill="currentColor"
                  />
                </span>
              )}
            </div>

            {/* Content Column */}
            <div className="flex flex-col justify-between p-6 lg:p-7 lg:col-span-7">
              <div>
                {/* Brand & Year Header */}
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[13px] font-black uppercase tracking-wider text-[#C9943A]">
                    {car.brand} {car.year ? `· ${car.year}` : ""}
                  </p>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold text-white/50">
                    {car.category}
                  </span>
                </div>

                {/* Model Title */}
                <h2 className="mt-1.5 text-2xl font-black tracking-tight text-white lg:text-[26px]">
                  {car.model}
                </h2>

                {/* Core Identification Badges */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {car.vehicleType && (
                    <span className="rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-[12px] font-semibold text-white/80">
                      <span className="text-white/40 mr-1.5">Type:</span>
                      {car.vehicleType}
                    </span>
                  )}
                  {car.powertrain && (
                    <span className="rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-[12px] font-semibold text-white/80">
                      <span className="text-white/40 mr-1.5">Powertrain:</span>
                      {car.powertrain}
                    </span>
                  )}
                  {car.keySpec && (
                    <span className="rounded-lg border border-[#C9943A]/20 bg-[#C9943A]/5 px-3 py-1.5 text-[12px] font-semibold text-[#E5B562]">
                      <span className="text-[#C9943A]/60 mr-1.5">Spec:</span>
                      {car.keySpec}
                    </span>
                  )}
                </div>

                {/* Available Colours */}
                {car.colors && car.colors.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="text-[12px] font-semibold text-white/40">
                      Available Colours:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {car.colors.map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => setSelectedColor(color.name)}
                          title={color.name}
                          className={`group/color relative h-6 w-6 rounded-full border transition-all ${
                            selectedColor === color.name
                              ? "border-[#C9943A] scale-110 ring-2 ring-[#C9943A]/40"
                              : "border-white/20 hover:border-white/60"
                          }`}
                          style={{ backgroundColor: color.hex }}
                        >
                          <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/90 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover/color:opacity-100 border border-white/10 z-20">
                            {color.name}
                          </span>
                        </button>
                      ))}
                    </div>
                    {selectedColor && (
                      <span className="text-[11px] font-medium text-white/50">
                        ({selectedColor})
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Row: Price Range (Protected) + Actions */}
              <div className="mt-6 pt-5 border-t border-white/8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  {isLoggedIn ? (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">
                        Estimated Price Range
                      </p>
                      <p className="text-2xl font-black tracking-tight text-[#C9943A]">
                        {formatVehiclePriceRange(car)}
                      </p>
                      <p className="text-[10px] font-medium text-white/40">
                        Final cost confirmed at closing (varies by trim &amp; duty)
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="inline-flex items-center gap-2 rounded-lg border border-[#C9943A]/30 bg-[#C9943A]/10 px-3 py-1.5 text-xs font-bold text-[#C9943A]">
                        <Lock className="h-3.5 w-3.5" />
                        <span>Price range available after login</span>
                      </div>
                      <Link
                        href="/login?next=/new-cars"
                        className="text-xs font-extrabold text-[#C9943A] underline underline-offset-4 hover:text-[#E0AE5A] transition-colors"
                      >
                        Sign in
                      </Link>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5">
                  <Link
                    href={detailHref}
                    className="flex h-11 items-center justify-center rounded-lg border border-[#C9943A]/30 bg-[#C9943A]/10 px-5 text-[13px] font-black text-[#C9943A] transition-all hover:bg-[#C9943A]/20 hover:border-[#C9943A]/50"
                  >
                    View Details
                  </Link>
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="flex h-11 items-center justify-center gap-1.5 rounded-lg bg-[#25D366] px-5 text-[13px] font-black text-black transition-colors hover:bg-[#20BD5A]"
                  >
                    <MessageCircle className="h-4 w-4" fill="currentColor" />
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>

        <InquireModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleInquire}
          itemName={`${car.brand} ${car.model} (${car.year ?? "New"})`}
          isSubmitting={isSubmitting}
        />
      </>
    );
  }

  // Grid layout (2 vehicles per row when selected or on featured grid)
  return (
    <>
      <article
        id={car.id}
        className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/8 bg-[#0d0d0d] transition-all duration-300 hover:border-[#C9943A]/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
      >
        <div>
          {/* Image */}
          <div className="relative aspect-[16/10] overflow-hidden bg-[#111]">
            <Image
              src={car.image}
              alt={car.imageLabel || `${car.brand} ${car.model}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 1024px) 500px, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <span className="absolute left-4 top-4 rounded-full border border-[#C9943A]/30 bg-black/75 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-[#C9943A] backdrop-blur-md">
              {car.badgeLabel || `New ${car.year ?? 2025}`}
            </span>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[12px] font-black uppercase tracking-wider text-[#C9943A]">
                {car.brand} {car.year ? `· ${car.year}` : ""}
              </p>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold text-white/50">
                {car.category}
              </span>
            </div>

            <h2 className="mt-1 text-xl font-black tracking-tight text-white">
              {car.model}
            </h2>

            {/* Compact Identification Badges */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {car.vehicleType && (
                <span className="rounded-md border border-white/10 bg-white/4 px-2.5 py-1 text-[11px] font-semibold text-white/70">
                  {car.vehicleType}
                </span>
              )}
              {car.powertrain && (
                <span className="rounded-md border border-white/10 bg-white/4 px-2.5 py-1 text-[11px] font-semibold text-white/70">
                  {car.powertrain}
                </span>
              )}
              {car.keySpec && (
                <span className="rounded-md border border-[#C9943A]/20 bg-[#C9943A]/5 px-2.5 py-1 text-[11px] font-semibold text-[#E5B562]">
                  {car.keySpec}
                </span>
              )}
            </div>

            {/* Colors */}
            {car.colors && car.colors.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[11px] font-semibold text-white/40">
                  Colours:
                </span>
                <div className="flex items-center gap-1.5">
                  {car.colors.map((color) => (
                    <span
                      key={color.name}
                      title={color.name}
                      className="h-4 w-4 rounded-full border border-white/20"
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-6 pt-0">
          <div className="mb-4 pt-4 border-t border-white/8">
            {isLoggedIn ? (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Estimated Price Range
                </p>
                <p className="text-xl font-black tracking-tight text-[#C9943A]">
                  {formatVehiclePriceRange(car)}
                </p>
                <p className="text-[9px] font-medium text-white/40">
                  Varies by trim &amp; landing cost
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-[#C9943A]/20 bg-[#C9943A]/5 px-3 py-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#C9943A]">
                  <Lock className="h-3 w-3" />
                  <span>Price upon login</span>
                </div>
                <Link
                  href="/login?next=/new-cars"
                  className="text-[11px] font-extrabold text-[#C9943A] underline hover:text-[#E0AE5A]"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href={detailHref}
              className="flex h-10 items-center justify-center rounded-lg border border-[#C9943A]/30 bg-[#C9943A]/10 text-[12px] font-black text-[#C9943A] transition-all hover:bg-[#C9943A]/20"
            >
              Details
            </Link>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#25D366] text-[12px] font-black text-black transition-colors hover:bg-[#20BD5A]"
            >
              <MessageCircle className="h-3.5 w-3.5" fill="currentColor" />
              WhatsApp
            </button>
          </div>
        </div>
      </article>

      <InquireModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleInquire}
        itemName={`${car.brand} ${car.model} (${car.year ?? "New"})`}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
