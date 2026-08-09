"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Check, MessageCircle, ArrowLeft } from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { InquireModal } from "@/components/ui/InquireModal";
import {
  inquireVehicle,
  extractWhatsappLink,
  type ApiInventoryItem,
  PUBLIC_API_URL,
} from "@/lib/catalog-api";

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
  return (
    <div className={`animate-pulse rounded-lg bg-slate-100 ${className}`} />
  );
}

export default function UsedCarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<ApiInventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      try {
        const baseUrl = (
          process.env.NEXT_PUBLIC_AUTOSECURE_PUBLIC_API_URL ?? PUBLIC_API_URL
        ).replace(/\/+$/, "");
        const res = await fetch(`${baseUrl}/catalog/vehicles/${id}`, {
          signal: AbortSignal.timeout(15_000),
        });
        if (res.status === 404) {
          if (!cancelled) setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as {
          data?: ApiInventoryItem;
        } & ApiInventoryItem;
        const data: ApiInventoryItem = json.data ?? json;
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
      <main className="min-h-screen bg-[#F6FFFD] px-6 pb-28 pt-14 lg:px-16">
        <div className="mx-auto max-w-[1210px]">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[13px] font-black text-[#8CA0C0]">
            <Link href="/" className="hover:text-navy-900/70">
              Home
            </Link>
            <span className="text-[#D8E1EF]">/</span>
            <Link href="/used-cars" className="text-[#0F9283] hover:underline">
              Used Cars
            </Link>
            {vehicle && (
              <>
                <span className="text-[#D8E1EF]">/</span>
                <span className="text-[#071225]">{title}</span>
              </>
            )}
          </nav>

          <Link
            href="/used-cars"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#0F9283] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Used Cars
          </Link>

          {loading ? (
            <div className="mt-8 grid gap-10 lg:grid-cols-2">
              <SkeletonBlock className="h-[380px]" />
              <div className="space-y-4">
                <SkeletonBlock className="h-8 w-3/4" />
                <SkeletonBlock className="h-5 w-1/2" />
                <SkeletonBlock className="h-24 w-full" />
                <SkeletonBlock className="h-10 w-1/3" />
                <SkeletonBlock className="h-11 w-full" />
              </div>
            </div>
          ) : notFound || !vehicle ? (
            <div className="mt-16 text-center">
              <p className="text-2xl font-black text-[#071225]">
                Vehicle not found
              </p>
              <p className="mt-2 text-sm text-[#8CA0C0]">
                This listing may have been removed or is no longer available.
              </p>
              <Link
                href="/used-cars"
                className="mt-6 inline-block rounded-lg bg-[#0F9283] px-6 py-3 text-sm font-black text-white hover:bg-[#0c7a6d]"
              >
                Browse Used Cars
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-10 lg:grid-cols-2">
              {/* Image */}
              <div className="overflow-hidden rounded-2xl bg-[#EEF3F8]">
                {image ? (
                  <div className="relative h-[380px]">
                    <Image
                      src={image}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 50vw, 100vw"
                    />
                  </div>
                ) : (
                  <div className="flex h-[380px] items-center justify-center text-[#8CA0C0]">
                    No image available
                  </div>
                )}
              </div>

              {/* Details */}
              <div>
                <p className="text-[13px] font-black uppercase tracking-wide text-[#8CA0C0]">
                  {vehicle.brand}
                  {vehicle.year ? ` · ${vehicle.year}` : ""}
                </p>
                <h1 className="mt-1 text-[34px] font-black leading-tight tracking-[-0.04em] text-[#071225]">
                  {title}
                </h1>

                {vehicle.dealBadges && vehicle.dealBadges.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {vehicle.dealBadges.map((badge) => (
                      <span
                        key={badge}
                        className="rounded-full bg-[#FFF0F2] px-3 py-1.5 text-[11px] font-black text-[#EF3D48]"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-[#10B981] shadow-sm">
                    <Check className="h-3 w-3" strokeWidth={3} /> Certified
                  </span>
                  {vehicle.condition && (
                    <span className="rounded-full bg-[#F0FFFC] px-3 py-1.5 text-[11px] font-black text-[#0F9283]">
                      {vehicle.condition}
                    </span>
                  )}
                  {vehicle.transmission && (
                    <span className="rounded-full bg-[#EEF3FF] px-3 py-1.5 text-[11px] font-black text-[#2454D6]">
                      {vehicle.transmission}
                    </span>
                  )}
                  {vehicle.fuelType && (
                    <span className="rounded-full border border-[#DDE6F2] px-3 py-1.5 text-[11px] font-black text-[#5A7090]">
                      {vehicle.fuelType}
                    </span>
                  )}
                  {vehicle.color && (
                    <span className="rounded-full border border-[#DDE6F2] px-3 py-1.5 text-[11px] font-black text-[#5A7090]">
                      {vehicle.color}
                    </span>
                  )}
                  {vehicle.interiorColor && (
                    <span className="rounded-full border border-[#DDE6F2] px-3 py-1.5 text-[11px] font-black text-[#5A7090]">
                      Interior: {vehicle.interiorColor}
                    </span>
                  )}
                </div>

                {vehicle.description && (
                  <p className="mt-5 text-[15px] leading-7 text-[#5A7090]">
                    {vehicle.description}
                  </p>
                )}

                {specs.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {specs.map((spec) => (
                      <div
                        key={spec.label}
                        className="rounded-xl border border-[#DDE6F2] bg-white p-3 text-center"
                      >
                        <p className="text-[13px] font-black text-[#071225]">
                          {spec.value}
                        </p>
                        <p className="mt-0.5 text-[10px] font-semibold text-[#A0AEC7]">
                          {spec.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {vehicle.keyFeatures && vehicle.keyFeatures.length > 0 && (
                  <div className="mt-6">
                    <p className="text-[12px] font-black uppercase tracking-wide text-[#8CA0C0]">
                      Key Features
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {vehicle.keyFeatures.map((feature) => (
                        <span
                          key={feature}
                          className="rounded-[6px] bg-[#F0FFFC] px-3 py-1 text-[11px] font-black text-[#0F9283]"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="mt-6 text-[34px] font-black leading-none tracking-[-0.04em] text-[#071225]">
                  {formatNaira(price)}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Link
                    href="/used-cars"
                    className="flex h-12 items-center justify-center rounded-[10px] border border-[#BDEFE4] bg-[#F0FFFC] text-[13px] font-black text-[#0F9F8A] hover:bg-[#E0FAF4]"
                  >
                    ← Back to Listings
                  </Link>
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#25D366] text-[13px] font-black text-white hover:bg-[#20BD5A]"
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
