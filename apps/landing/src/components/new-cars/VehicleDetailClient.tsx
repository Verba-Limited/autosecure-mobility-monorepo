"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, ArrowLeft, Lock } from "lucide-react";
import { InquireModal } from "@/components/ui/InquireModal";
import { CARS } from "@/data/cars";
import { getCustomerEmail } from "@/lib/auth-api";
import {
  inquireVehicle,
  extractWhatsappLink,
  buildWhatsappUrl,
  fetchCatalogItem,
  type ApiInventoryItem,
} from "@/lib/catalog-api";
import { formatVehiclePriceRange } from "@/lib/pricing-utils";
import { isVehicleSaved, toggleFavorite, subscribeToFavorites } from "@/lib/favorites";

function formatNaira(value?: number) {
  if (!value || isNaN(Number(value))) return "N/A";
  return `₦${Number(value).toLocaleString("en-NG")}`;
}

function readPrice(item: ApiInventoryItem): number {
  return (
    item.pricing?.retail ??
    item.pricing?.promotional ??
    item.pricing?.financing?.downPayment ??
    item.price ??
    0
  );
}

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-white/6 ${className}`} />
  );
}

export function VehicleDetailClient({ id }: { id: string }) {
  const [vehicle, setVehicle] = useState<ApiInventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoggedIn] = useState(() => Boolean(getCustomerEmail()));
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsSaved(isVehicleSaved(id));
    return subscribeToFavorites(() => {
      setIsSaved(isVehicleSaved(id));
    });
  }, [id]);

  function handleToggleFavorite() {
    if (!vehicle || !id) return;
    const next = toggleFavorite({
      id,
      title: (vehicle.title ?? `${vehicle.brand ?? ""} ${vehicle.model ?? ""}`.trim()) || "Brand New Vehicle",
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      image: vehicle.images?.[0],
      price: readPrice(vehicle),
      priceRange: formatVehiclePriceRange(vehicle),
      type: "BRAND_NEW_CAR",
      category: vehicle.bodyType,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
    });
    setIsSaved(next);
  }

  useEffect(() => {
    let cancelled = false;

    function applyFallback() {
      const fallback = CARS.find((c) => c.id === id);
      if (fallback) {
        if (!cancelled) {
          setVehicle({
            _id: fallback.id,
            brand: fallback.brand,
            model: fallback.model,
            year: fallback.year ?? "2025",
            bodyType: fallback.vehicleType,
            fuelType: fallback.powertrain,
            transmission: fallback.keySpec,
            images: [fallback.image],
            pricing: { retail: fallback.price },
            description: `Factory-fresh ${fallback.brand} ${fallback.model} (${fallback.year ?? "2025"}). Equipped with ${fallback.powertrain} and ${fallback.keySpec}. Available for immediate delivery or nationwide allocation.`,
            keyFeatures: [
              "Panoramic Sunroof",
              "Blind Spot Monitor",
              "Leather Interior",
              "Bluetooth",
              "Parking Sensors",
              "360° Camera",
              "Navigation System",
            ],
            dealBadges: ["Brand New", "In Stock"],
          } as unknown as ApiInventoryItem);
        }
        return true;
      }
      return false;
    }

    async function load() {
      try {
        const data = await fetchCatalogItem(`/catalog/vehicles/${id}`);
        if (!data) {
          if (!applyFallback()) {
            if (!cancelled) setNotFound(true);
          }
          return;
        }
        if (!cancelled) setVehicle(data);
      } catch {
        if (!applyFallback()) {
          if (!cancelled) setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleInquire(data: {
    customerPhone: string;
    customerEmail: string;
  }) {
    setIsSubmitting(true);
    try {
      const res = await inquireVehicle(id, data);
      const link = extractWhatsappLink(
        res,
        `Hi, I'm interested in the ${vehicle?.title ?? "vehicle"} listed on autoSecure Mobility.`,
      );
      window.open(link, "_blank", "noopener,noreferrer");
      setModalOpen(false);
    } catch {
      window.open(
        buildWhatsappUrl(
          `Hi, I'm interested in a vehicle on autoSecure Mobility.`,
        ),
        "_blank",
        "noopener,noreferrer",
      );
      setModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  const title =
    (vehicle?.title ??
      `${vehicle?.brand ?? ""} ${vehicle?.model ?? ""}`.trim()) ||
    "Vehicle";
  const price = vehicle ? readPrice(vehicle) : 0;
  const images = vehicle?.images?.length ? vehicle.images : [];
  const activeImage = images[selectedImageIndex] ?? images[0];

  // Only include tiles for fields that actually have data
  const specs = vehicle
    ? [
        { label: "Fuel", value: vehicle.fuelType ?? null },
        { label: "Transmission", value: vehicle.transmission ?? null },
        {
          label: "Seats",
          value: vehicle.seatingCapacity
            ? String(vehicle.seatingCapacity)
            : null,
        },
        { label: "Body Type", value: vehicle.bodyType ?? null },
        { label: "Drive Type", value: vehicle.driveType ?? null },
        {
          label: "Engine",
          value: vehicle.engineType ?? vehicle.engineCapacity ?? null,
        },
        { label: "Horsepower", value: vehicle.horsepower ?? null },
        { label: "Top Speed", value: vehicle.topSpeed ?? null },
        { label: "Fuel Economy", value: vehicle.fuelEconomy ?? null },
        {
          label: "Mileage",
          value: vehicle.mileage ? `${vehicle.mileage} km` : null,
        },
      ].filter((s) => s.value)
    : [];

  if (loading) {
    return (
      <div className="mt-8 grid gap-10 lg:grid-cols-2 items-start">
        <SkeletonBlock className="aspect-[16/10] w-full" />
        <div className="space-y-4">
          <SkeletonBlock className="h-5 w-1/3" />
          <SkeletonBlock className="h-10 w-3/4" />
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-10 w-1/2" />
          <SkeletonBlock className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (notFound || !vehicle) {
    return (
      <div className="mt-16 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/8 bg-white/4 text-[40px]">
          🔍
        </div>
        <p className="text-2xl font-black text-white">Vehicle not found</p>
        <p className="mt-2 text-sm text-white/40">
          This listing may have been removed or is no longer available.
        </p>
        <Link
          href="/new-cars"
          className="mt-6 inline-block rounded-lg bg-[#C9943A] px-6 py-3 text-sm font-bold text-black hover:bg-[#E0AE5A] shadow-[0_4px_16px_rgba(201,148,58,0.3)]"
        >
          Browse New Cars
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/new-cars"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#C9943A] hover:text-[#E0AE5A] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to New Cars
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 items-start">
        {/* Image */}
        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#0d0d0d]">
            {activeImage ? (
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src={activeImage}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            ) : (
              <div className="flex aspect-[16/10] items-center justify-center text-white/20">
                <span className="text-[64px]">🚗</span>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border transition-all ${
                    selectedImageIndex === idx
                      ? "border-[#C9943A] ring-1 ring-[#C9943A]"
                      : "border-white/10 opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${title} thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-[13px] font-black uppercase tracking-wide text-white/30">
            {vehicle.brand}
            {vehicle.year ? ` · ${vehicle.year}` : ""}
          </p>
          <h1 className="mt-1 text-[36px] font-black leading-tight tracking-[-0.04em] text-white">
            {title}
          </h1>

          {/* Deal badges */}
          {vehicle.dealBadges && vehicle.dealBadges.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {vehicle.dealBadges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[11px] font-black text-red-400"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}

          {/* Feature badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            {vehicle.condition && (
              <span className="rounded-full border border-[#C9943A]/25 bg-[#C9943A]/10 px-3 py-1.5 text-[11px] font-black text-[#C9943A]">
                {vehicle.condition === "NEW" ? "Brand New" : vehicle.condition}
              </span>
            )}
            {vehicle.transmission && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-black text-white/50">
                {vehicle.transmission}
              </span>
            )}
            {vehicle.fuelType && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-black text-white/50">
                {vehicle.fuelType}
              </span>
            )}
            {vehicle.color && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-black text-white/50">
                {vehicle.color}
              </span>
            )}
            {vehicle.interiorColor && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-black text-white/50">
                Interior: {vehicle.interiorColor}
              </span>
            )}
          </div>

          {vehicle.description && (
            <p className="mt-5 text-[15px] leading-7 text-white/45">
              {vehicle.description}
            </p>
          )}

          {/* Specs grid */}
          {specs.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="rounded-xl border border-white/8 bg-white/4 p-3 text-center"
                >
                  <p className="text-[13px] font-black text-white">
                    {spec.value}
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold text-white/30">
                    {spec.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Key features */}
          {vehicle.keyFeatures && vehicle.keyFeatures.length > 0 && (
            <div className="mt-6">
              <p className="text-[12px] font-black uppercase tracking-wide text-white/30">
                Key Features
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {vehicle.keyFeatures.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-[6px] border border-[#C9943A]/20 bg-[#C9943A]/8 px-3 py-1 text-[11px] font-black text-[#C9943A]"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="mt-6">
            {isLoggedIn ? (
              <div className="rounded-2xl border border-[#C9943A]/25 bg-gradient-to-br from-[#18140a] via-[#111111] to-[#0c0c0c] p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#C9943A]">
                      Estimated Price Range
                    </p>
                    <p className="mt-1 text-[32px] sm:text-[36px] font-black leading-none tracking-[-0.04em] text-[#C9943A]">
                      {formatVehiclePriceRange(vehicle)}
                    </p>
                  </div>
                  <span className="self-start rounded-full border border-[#C9943A]/30 bg-[#C9943A]/10 px-3 py-1 text-[11px] font-bold text-[#E5B562]">
                    Trim &amp; Duty Dependent
                  </span>
                </div>
                <p className="mt-3 border-t border-white/8 pt-3 text-xs leading-relaxed text-white/55">
                  The exact final price is determined when you progress toward closing the transaction based on selected trim, detailed specifications, duty, port clearance, and other applicable landing costs.
                </p>
                {vehicle.pricing?.financing && (
                  <p className="mt-2 text-xs text-white/40">
                    Finance estimate from{" "}
                    <span className="font-bold text-[#C9943A]">
                      {formatNaira(vehicle.pricing.financing.emi)}/mo
                    </span>{" "}
                    · Down payment terms apply
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#C9943A]/25 bg-gradient-to-br from-[#18140a] to-[#0c0c0c] p-6 shadow-xl">
                <div className="flex items-center gap-2.5 text-[#C9943A]">
                  <Lock className="h-5 w-5" />
                  <p className="text-base font-bold">Pricing Protected</p>
                </div>
                <p className="mt-2 text-sm text-white/60 leading-relaxed">
                  Sign in or create an account to view full pricing, breakdown calculations, and financing options for this vehicle.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/login?next=/new-cars/${id}`}
                    className="rounded-lg bg-[#C9943A] px-5 py-2.5 text-xs font-bold text-black hover:bg-[#E0AE5A] shadow-[0_4px_16px_rgba(201,148,58,0.25)] transition-all"
                  >
                    Log In
                  </Link>
                  <Link
                    href={`/register?next=/new-cars/${id}`}
                    className="rounded-lg border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition-all"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={handleToggleFavorite}
              className={`flex h-12 items-center justify-center gap-2 rounded-[10px] border text-[13px] font-black transition-all ${
                isSaved
                  ? "border-rose-500/50 bg-rose-500/15 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                  : "border-white/12 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Heart className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} strokeWidth={2.5} />
              {isSaved ? "Saved to Favorites" : "Save Favorite"}
            </button>
            <Link
              href="/new-cars"
              className="flex h-12 items-center justify-center rounded-[10px] border border-white/10 bg-white/5 text-[13px] font-black text-white/50 hover:bg-white/8 hover:text-white/70 transition-all text-center"
            >
              ← All New Cars
            </Link>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#25D366] text-[13px] font-black text-black hover:bg-[#20BD5A] transition-colors"
            >
              <MessageCircle className="h-4 w-4" fill="currentColor" />
              WhatsApp Seller
            </button>
          </div>
        </div>
      </div>

      <InquireModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleInquire}
        itemName={title}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
