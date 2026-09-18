"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Check, MessageCircle, ArrowLeft, Lock } from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { InquireModal } from "@/components/ui/InquireModal";
import { getCustomerEmail } from "@/lib/auth-api";
import {
  inquireVehicle,
  extractWhatsappLink,
  fetchCatalogItem,
  type ApiInventoryItem,
} from "@/lib/catalog-api";
import { formatVehiclePriceRange } from "@/lib/pricing-utils";

function formatNaira(value?: number) {
  if (!value || isNaN(Number(value))) return "N/A";
  return `₦${Number(value).toLocaleString("en-NG")}`;
}

function readPrice(item: ApiInventoryItem): number {
  return (
    item.pricing?.retail ??
    item.pricing?.promotional ??
    item.pricing?.financing?.downPayment ??
    0
  );
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/6 ${className}`} />;
}

export default function UsedCarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<ApiInventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn] = useState(() => Boolean(getCustomerEmail()));

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchCatalogItem(`/catalog/vehicles/${id}`);
        if (!data) {
          if (!cancelled) setNotFound(true);
          return;
        }
        if (!cancelled) setVehicle(data);
      } catch {
        if (!cancelled) setNotFound(true);
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
    if (!id) return;
    setIsSubmitting(true);
    try {
      const res = await inquireVehicle(id, data);
      const link = extractWhatsappLink(res);
      window.open(
        link ??
          `https://wa.me/?text=${encodeURIComponent(`Hi, I'm interested in the used car listed on autoSecure Mobility.`)}`,
        "_blank",
        "noopener,noreferrer",
      );
      setModalOpen(false);
    } catch {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`Hi, I'm interested in a used car on autoSecure Mobility.`)}`,
        "_blank",
        "noopener,noreferrer",
      );
      setModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  const title =
    vehicle?.title ?? `${vehicle?.brand ?? ""} ${vehicle?.model ?? ""}`.trim();
  const price = vehicle ? readPrice(vehicle) : 0;
  const image = vehicle?.images?.[0];

  const specs = vehicle
    ? [
        {
          label: "Mileage",
          value: vehicle.mileage ? `${vehicle.mileage} km` : null,
        },
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
      ].filter((s) => s.value)
    : [];

  return (
    <>
      <Header />
      <main className="min-h-screen overflow-x-hidden bg-black px-6 pb-20 pt-12 lg:px-16">
        <div className="mx-auto w-full max-w-[1210px]">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[13px] font-semibold text-white/30">
            <Link href="/" className="hover:text-white/60 transition-colors">
              Home
            </Link>
            <span className="text-white/15">/</span>
            <Link
              href="/used-cars"
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Used Cars
            </Link>
            {vehicle && (
              <>
                <span className="text-white/15">/</span>
                <span className="text-white/60">{title}</span>
              </>
            )}
          </nav>

          <Link
            href="/used-cars"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Used Cars
          </Link>

          {loading ? (
            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              <SkeletonBlock className="h-[300px] min-w-full" />
              <div className="space-y-4 min-w-0">
                <SkeletonBlock className="h-8 w-full max-w-lg" />
                <SkeletonBlock className="h-5 w-1/2" />
                <SkeletonBlock className="h-24 w-full" />
                <SkeletonBlock className="h-10 w-1/3" />
                <SkeletonBlock className="h-11 w-full" />
              </div>
            </div>
          ) : notFound || !vehicle ? (
            <div className="mt-16 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/8 bg-white/4 text-[40px]">
                🔑
              </div>
              <p className="text-2xl font-black text-white">
                Vehicle not found
              </p>
              <p className="mt-2 text-sm text-white/40">
                This listing may have been removed or is no longer available.
              </p>
              <Link
                href="/used-cars"
                className="mt-6 inline-block rounded-lg bg-emerald-500 px-6 py-3 text-sm font-bold text-black hover:bg-emerald-400"
              >
                Browse Used Cars
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-10 lg:grid-cols-2 items-start">
              {/* Image */}
              <div className="overflow-hidden rounded-2xl border border-white/8">
                {image ? (
                  <div className="relative aspect-[1.9/1] max-h-[340px] w-full overflow-hidden">
                    <Image
                      src={image}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 50vw, 100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                ) : (
                  <div className="flex aspect-[1.9/1] items-center justify-center bg-[#0d0d0d] text-[64px]">
                    🔑
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="min-w-0">
                <p className="text-[13px] font-black uppercase tracking-wide text-white/30">
                  {vehicle.brand}
                  {vehicle.year ? ` · ${vehicle.year}` : ""}
                </p>
                <h1 className="mt-1 text-[34px] font-black leading-tight tracking-[-0.04em] text-white">
                  {title}
                </h1>

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

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-black text-emerald-400">
                    <Check className="h-3 w-3" strokeWidth={3} /> Certified
                  </span>
                  {vehicle.condition && (
                    <span className="rounded-full border border-emerald-500/15 bg-emerald-500/8 px-3 py-1.5 text-[11px] font-black text-emerald-400">
                      {vehicle.condition}
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

                {vehicle.keyFeatures && vehicle.keyFeatures.length > 0 && (
                  <div className="mt-6">
                    <p className="text-[12px] font-black uppercase tracking-wide text-white/30">
                      Key Features
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {vehicle.keyFeatures.map((feature) => (
                        <span
                          key={feature}
                          className="rounded-[6px] border border-emerald-500/20 bg-emerald-500/8 px-3 py-1 text-[11px] font-black text-emerald-400"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  {isLoggedIn ? (
                    <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-[#0a1f18] via-[#0c1411] to-[#0c0c0c] p-6 shadow-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                            Estimated Price Range
                          </p>
                          <p className="mt-1 text-[32px] sm:text-[34px] font-black leading-none tracking-[-0.04em] text-white">
                            {formatVehiclePriceRange(vehicle)}
                          </p>
                        </div>
                        <span className="self-start rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-300">
                          Condition &amp; Duty Dependent
                        </span>
                      </div>
                      <p className="mt-3 border-t border-white/8 pt-3 text-xs leading-relaxed text-white/50">
                        The exact final price is determined when you progress
                        toward closing the transaction based on vehicle
                        condition report, warranty packages, registration, and
                        landing fees.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-[#0a1f18] to-[#0c0c0c] p-6 shadow-xl">
                      <div className="flex items-center gap-2.5 text-emerald-400">
                        <Lock className="h-5 w-5" />
                        <p className="text-base font-bold">Pricing Protected</p>
                      </div>
                      <p className="mt-2 text-sm text-white/60 leading-relaxed">
                        Sign in or create an account to view certified pricing,
                        dealer discounts, and warranty terms for this vehicle.
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <Link
                          href={`/login?next=/used-cars/${id}`}
                          className="rounded-lg bg-emerald-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-emerald-400 shadow-[0_4px_16px_rgba(16,185,129,0.25)] transition-all"
                        >
                          Log In
                        </Link>
                        <Link
                          href={`/register?next=/used-cars/${id}`}
                          className="rounded-lg border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition-all"
                        >
                          Create Account
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Link
                    href="/used-cars"
                    className="flex h-12 items-center justify-center rounded-[10px] border border-emerald-500/15 bg-emerald-500/8 text-[13px] font-black text-emerald-400 hover:bg-emerald-500/15 transition-all"
                  >
                    ← Back to Listings
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
          )}
        </div>
      </main>
      <Footer />

      <InquireModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleInquire}
        itemName={title || "Used Vehicle"}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
