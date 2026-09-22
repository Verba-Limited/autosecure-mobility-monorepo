"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, ArrowLeft, Package } from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { InquireModal } from "@/components/ui/InquireModal";
import {
  inquirePart,
  extractWhatsappLink,
  buildWhatsappUrl,
  fetchCatalogItem,
  type ApiInventoryItem,
} from "@/lib/catalog-api";

function formatNaira(value?: number | null) {
  if (!value || isNaN(Number(value))) return null;
  return `₦${Number(value).toLocaleString("en-NG")}`;
}

function readPrice(item: ApiInventoryItem): number | null {
  // Check top-level price first
  if (typeof item.price === "number" && item.price > 0) return item.price;
  // Then nested pricing object
  const p = item.pricing;
  if (!p) return null;
  return (
    p.retail ??
    p.promotional ??
    p.fleet ??
    p.priceRange?.min ??
    p.financing?.downPayment ??
    null
  );
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/6 ${className}`} />;
}

export default function PartDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [part, setPart] = useState<ApiInventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchCatalogItem(`/catalog/parts/${id}`);
        if (!data) {
          if (!cancelled) setNotFound(true);
          return;
        }
        if (!cancelled) setPart(data);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  async function handleInquire(data: { customerPhone: string; customerEmail: string }) {
    if (!id) return;
    setIsSubmitting(true);
    try {
      const res = await inquirePart(id, data);
      const link = extractWhatsappLink(res, `Hi, I'm interested in ${part?.title ?? part?.partName ?? "a part"} on autoSecure Mobility.`);
      window.open(
        link,
        "_blank",
        "noopener,noreferrer",
      );
      setModalOpen(false);
    } catch {
      window.open(
        buildWhatsappUrl(`Hi, I'm interested in ${part?.title ?? part?.partName ?? "a part"} on autoSecure Mobility.`),
        "_blank",
        "noopener,noreferrer",
      );
      setModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  const title = part?.title ?? part?.partName ?? "Part";
  const price = part ? readPrice(part) : 0;
  const image = part?.images?.[0];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black px-6 pb-28 pt-14 lg:px-16">
        <div className="mx-auto max-w-[1210px]">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[13px] font-semibold text-white/30">
            <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
            <span className="text-white/15">/</span>
            <Link href="/parts" className="text-blue-400 hover:text-blue-300 transition-colors">Aftermarket Parts</Link>
            {part && (
              <>
                <span className="text-white/15">/</span>
                <span className="text-white/60">{title}</span>
              </>
            )}
          </nav>

          <Link
            href="/parts"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Parts
          </Link>

          {loading ? (
            <div className="mt-8 grid gap-10 lg:grid-cols-2">
              <SkeletonBlock className="h-[360px]" />
              <div className="space-y-4">
                <SkeletonBlock className="h-6 w-1/3" />
                <SkeletonBlock className="h-8 w-2/3" />
                <SkeletonBlock className="h-20 w-full" />
                <SkeletonBlock className="h-10 w-1/3" />
                <SkeletonBlock className="h-11 w-full" />
              </div>
            </div>
          ) : notFound || !part ? (
            <div className="mt-16 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/8 bg-white/4">
                <Package className="h-10 w-10 text-white/20" />
              </div>
              <p className="text-2xl font-black text-white">Part not found</p>
              <p className="mt-2 text-sm text-white/40">This listing may have been removed or is no longer available.</p>
              <Link href="/parts" className="mt-6 inline-block rounded-lg bg-blue-500 px-6 py-3 text-sm font-bold text-white hover:bg-blue-400">
                Browse Parts
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-10 lg:grid-cols-2 items-start">
              {/* Image / icon */}
              <div className="flex items-center justify-center overflow-hidden rounded-2xl border border-white/8 bg-[#0d0d0d] p-10">
                {image ? (
                  <div className="relative h-[320px] w-full">
                    <Image src={image} alt={title} fill className="object-contain drop-shadow-2xl" sizes="(min-width: 1024px) 50vw, 100vw" />
                  </div>
                ) : (
                  <Package className="h-32 w-32 text-blue-400/30" />
                )}
              </div>

              {/* Details */}
              <div>
                {part.partCategory && (
                  <p className="text-[11px] font-black uppercase tracking-wide text-blue-400">
                    {part.partCategory}
                  </p>
                )}
                <h1 className="mt-1 text-[30px] font-black leading-tight tracking-[-0.04em] text-white">
                  {title}
                </h1>

                {/* Badges */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1.5 text-[11px] font-black ${
                      part.inStock === false
                        ? "border border-white/10 bg-white/5 text-white/40"
                        : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {part.inStock === false ? "Out of Stock" : "In Stock"}
                  </span>
                  {part.brand && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-black text-white/50">
                      {part.brand}
                    </span>
                  )}
                  {part.vehicleCompatibility?.map((v) => (
                    <span key={v} className="rounded-full border border-blue-500/20 bg-blue-500/8 px-3 py-1.5 text-[11px] font-black text-blue-400">
                      {v}
                    </span>
                  ))}
                </div>

                {part.description && (
                  <p className="mt-5 text-[15px] leading-7 text-white/45">
                    {part.description}
                  </p>
                )}

                {/* Delivery */}
                <div className="mt-5 rounded-xl border border-white/8 bg-white/4 p-4">
                  <p className="text-[12px] font-black uppercase tracking-wide text-white/30">Delivery</p>
                  <p className="mt-1 text-sm font-semibold text-white/70">Standard · 3-5 business days</p>
                </div>

                {/* Price */}
                {price !== null ? (
                  <p className="mt-6 text-[34px] font-black leading-none tracking-[-0.04em] text-[#C9943A]">
                    {formatNaira(price)}
                  </p>
                ) : (
                  <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
                    <span className="text-sm font-bold text-white/50">Price on request</span>
                    <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[11px] font-black text-blue-400">
                      Inquire via WhatsApp
                    </span>
                  </div>
                )}

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Link
                    href="/parts"
                    className="flex h-12 items-center justify-center rounded-[10px] border border-blue-500/15 bg-blue-500/8 text-[13px] font-black text-blue-400 hover:bg-blue-500/15 transition-all"
                  >
                    ← Back to Parts
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
        itemName={title}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
