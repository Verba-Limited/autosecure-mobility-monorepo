"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Heart, Lock } from "lucide-react";
import type { UsedCar } from "@/data/usedCars";
import {
  inquireVehicle,
  extractWhatsappLink,
  buildWhatsappUrl,
} from "@/lib/catalog-api";
import { InquireModal } from "@/components/ui/InquireModal";
import { getCustomerEmail } from "@/lib/auth-api";
import { formatVehiclePriceRange } from "@/lib/pricing-utils";
import {
  isVehicleSaved,
  toggleFavorite,
  subscribeToFavorites,
} from "@/lib/favorites";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

const CATEGORY_STYLES: Record<UsedCar["category"], string> = {
  Hybrid: "border border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
  Sedan: "border border-blue-500/25 bg-blue-500/10 text-blue-400",
  SUV: "border border-orange-500/25 bg-orange-500/10 text-orange-400",
};

const CONDITION_STYLES: Record<UsedCar["condition"], string> = {
  Excellent: "text-emerald-400",
  "Like New": "text-emerald-400",
  Good: "text-amber-400",
};

export function UsedCarCard({ car }: { car: UsedCar }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn] = useState(() => Boolean(getCustomerEmail()));
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsSaved(isVehicleSaved(car.id));
    return subscribeToFavorites(() => {
      setIsSaved(isVehicleSaved(car.id));
    });
  }, [car.id]);

  function handleToggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleFavorite({
      id: car.id,
      title: `${car.brand} ${car.model}`,
      brand: car.brand,
      model: car.model,
      year: car.year,
      image: car.image,
      price: car.price,
      priceRange: car.priceRange,
      type: "USED_CAR",
      category: car.category,
      fuelType: car.fuelType,
      mileage: car.mileage,
      condition: car.condition,
      dealBadge: car.dealBadge,
    });
    setIsSaved(next);
  }

  const hasRealId = /^[0-9a-fA-F]{24}$/.test(car.id) || !car.id.includes("-");

  async function handleInquire(data: {
    customerPhone: string;
    customerEmail: string;
  }) {
    setIsSubmitting(true);
    try {
      const res = await inquireVehicle(car.id, data);
      const link = extractWhatsappLink(
        res,
        `Hi, I'm interested in the ${car.brand} ${car.model} used car listed on autoSecure Mobility.`,
      );
      window.open(link, "_blank", "noopener,noreferrer");
      setModalOpen(false);
    } catch {
      window.open(
        buildWhatsappUrl(
          `Hi, I'm interested in the ${car.brand} ${car.model} used car listed on autoSecure Mobility.`,
        ),
        "_blank",
        "noopener,noreferrer",
      );
      setModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <article
        id={car.id}
        className="group overflow-hidden rounded-2xl border border-white/8 bg-[#0d0d0d] transition-all duration-300 hover:border-emerald-500/25 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.7)]"
      >
        <div className="grid items-stretch lg:grid-cols-12">
          <div className="relative aspect-[16/10] overflow-hidden bg-[#111] lg:col-span-5 lg:aspect-auto lg:min-h-[290px]">
            <Image
              src={car.image}
              alt={`${car.brand} ${car.model}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 1024px) 378px, (min-width: 640px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute left-4 top-4 flex flex-col items-start gap-1.5">
              {car.dealBadge && (
                <span
                  className={`rounded-full px-3 py-1.5 text-[11px] font-black uppercase leading-none ${car.dealBadgeClassName}`}
                >
                  {car.dealBadge}
                </span>
              )}
              {car.statusBadges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-black/80 px-3 py-1.5 text-[11px] font-black uppercase leading-none text-emerald-400 backdrop-blur-sm"
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                  {badge}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={handleToggleFavorite}
              aria-label={
                isSaved ? "Remove from favorites" : "Save to favorites"
              }
              className={`absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-[8px] backdrop-blur-md border transition-all ${
                isSaved
                  ? "bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                  : "bg-black/60 border-white/10 text-white/60 hover:text-rose-400 hover:bg-black/80"
              }`}
            >
              <Heart
                className="h-4 w-4"
                fill={isSaved ? "currentColor" : "none"}
                strokeWidth={2.5}
              />
            </button>
          </div>

          <div className="flex flex-col justify-between p-6 lg:col-span-7 lg:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[12px] font-black uppercase tracking-wide text-white/30">
                  {car.brand} · {car.year}
                </p>
                <h2 className="mt-1 text-[19px] font-extrabold leading-tight text-white">
                  {car.model}
                </h2>
              </div>
              <span
                className={`mt-1 shrink-0 rounded-md px-2.5 py-1.5 text-[11px] font-black uppercase leading-none ${CATEGORY_STYLES[car.category]}`}
              >
                {car.category}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 border-y border-white/8 py-3.5 text-center">
              <div>
                <p className="text-[13px] font-black leading-tight text-white">
                  {car.mileage}
                </p>
                <p className="mt-1 text-[10px] font-semibold leading-tight text-white/30">
                  Mileage
                </p>
              </div>
              <div className="border-l border-white/8">
                <p className="text-[13px] font-black leading-tight text-white">
                  {car.fuelType}
                </p>
                <p className="mt-1 text-[10px] font-semibold leading-tight text-white/30">
                  Fuel Type
                </p>
              </div>
              <div className="border-l border-white/8">
                <p
                  className={`text-[13px] font-black leading-tight ${CONDITION_STYLES[car.condition]}`}
                >
                  {car.condition}
                </p>
                <p className="mt-1 text-[10px] font-semibold leading-tight text-white/30">
                  Condition
                </p>
              </div>
            </div>

            <div className="mt-4 min-h-[52px]">
              {isLoggedIn ? (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80">
                    Estimated Price Range
                  </p>
                  <p className="mt-0.5 text-[22px] font-black leading-tight tracking-[-0.03em] text-white">
                    {formatVehiclePriceRange(car)}
                  </p>
                  <p className="text-[10px] font-medium text-white/40">
                    Final price determined at transaction closing
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Price requires login</span>
                  </div>
                  <Link
                    href="/login?next=/used-cars"
                    className="text-xs font-extrabold text-emerald-400 underline hover:text-emerald-300 transition-colors"
                  >
                    Sign in
                  </Link>
                </div>
              )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 lg:max-w-md">
              {hasRealId ? (
                <Link
                  href={`/used-cars/${car.id}`}
                  className="flex h-11 items-center justify-center rounded-[8px] border border-emerald-500/25 bg-emerald-500/10 text-[13px] font-black text-emerald-400 transition-all hover:bg-emerald-500/20 hover:border-emerald-500/40"
                >
                  View Details
                </Link>
              ) : (
                <Link
                  href="/used-cars"
                  className="flex h-11 items-center justify-center rounded-[8px] border border-white/8 bg-white/5 text-[13px] font-black text-white/40 transition-all hover:bg-white/8 hover:text-white/60"
                >
                  Browse All
                </Link>
              )}
              <button
                type="button"
                id={`whatsapp-usedcar-${car.id}`}
                onClick={() => setModalOpen(true)}
                className="flex h-11 items-center justify-center gap-1.5 rounded-[8px] bg-[#25D366] text-[13px] font-black text-black transition-colors hover:bg-[#20BD5A]"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      </article>

      <InquireModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleInquire}
        itemName={`${car.brand} ${car.model} (${car.year})`}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
