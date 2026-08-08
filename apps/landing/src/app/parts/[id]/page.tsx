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
  return <div className={`animate-pulse rounded-lg bg-slate-100 ${className}`} />;
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
        const baseUrl = (
          process.env.NEXT_PUBLIC_AUTOSECURE_PUBLIC_API_URL ?? PUBLIC_API_URL
        ).replace(/\/+$/, "");
        const res = await fetch(`${baseUrl}/catalog/parts/${id}`, {
          signal: AbortSignal.timeout(15_000),
        });
        if (res.status === 404) {
          if (!cancelled) setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as { data?: ApiInventoryItem } & ApiInventoryItem;
        const data: ApiInventoryItem = json.data ?? json;
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
      const link = extractWhatsappLink(res);
      window.open(
        link ?? `https://wa.me/?text=${encodeURIComponent(`Hi, I'm interested in ${part?.title ?? "a part"} on autoSecure Mobility.`)}`,
        "_blank",
        "noopener,noreferrer",
      );
      setModalOpen(false);
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(`Hi, I'm interested in a part on autoSecure Mobility.`)}`, "_blank", "noopener,noreferrer");
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
      <main className="min-h-screen bg-[#FFFDF7] px-6 pb-28 pt-14 lg:px-16">
        <div className="mx-auto max-w-[1210px]">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[13px] font-black text-[#8CA0C0]">
            <Link href="/" className="hover:text-navy-900/70">Home</Link>
            <span className="text-[#D8E1EF]">/</span>
            <Link href="/parts" className="text-[#E48700] hover:underline">Aftermarket Parts</Link>
            {part && (
              <>
                <span className="text-[#D8E1EF]">/</span>
                <span className="text-[#071225]">{title}</span>
              </>
            )}
          </nav>

          <Link
            href="/parts"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#E48700] hover:underline"
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
              <p className="text-2xl font-black text-[#071225]">Part not found</p>
              <p className="mt-2 text-sm text-[#8CA0C0]">This listing may have been removed or is no longer available.</p>
              <Link href="/parts" className="mt-6 inline-block rounded-lg bg-[#E48700] px-6 py-3 text-sm font-black text-white hover:bg-[#c97800]">
                Browse Parts
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-10 lg:grid-cols-2">
              {/* Image / icon */}
              <div className="flex items-center justify-center overflow-hidden rounded-2xl bg-[#FFF3D6] p-10">
                {image ? (
                  <div className="relative h-[320px] w-full">
                    <Image src={image} alt={title} fill className="object-contain drop-shadow-xl" sizes="(min-width: 1024px) 50vw, 100vw" />
                  </div>
                ) : (
                  <Package className="h-32 w-32 text-[#E48700]/40" />
                )}
              </div>

              {/* Details */}
              <div>
                {part.partCategory && (
                  <p className="text-[11px] font-black uppercase tracking-wide text-[#E48700]">
                    {part.partCategory}
                  </p>
                )}
                <h1 className="mt-1 text-[30px] font-black leading-tight tracking-[-0.04em] text-[#071225]">
                  {title}
                </h1>

                {/* Badges */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1.5 text-[11px] font-black ${part.inStock === false ? "bg-slate-100 text-slate-500" : "bg-emerald-100 text-emerald-700"}`}>
                    {part.inStock === false ? "Out of Stock" : "In Stock"}
                  </span>
                  {part.brand && (
                    <span className="rounded-full border border-[#DDE6F2] px-3 py-1.5 text-[11px] font-black text-[#5A7090]">
                      {part.brand}
                    </span>
                  )}
                  {part.vehicleCompatibility?.map((v) => (
                    <span key={v} className="rounded-full bg-[#FFF3D6] px-3 py-1.5 text-[11px] font-black text-[#E48700]">
                      {v}
                    </span>
                  ))}
                </div>

                {part.description && (
                  <p className="mt-5 text-[15px] leading-7 text-[#5A7090]">
                    {part.description}
                  </p>
                )}

                {/* Delivery */}
                <div className="mt-5 rounded-xl border border-[#DDE6F2] bg-white p-4">
                  <p className="text-[12px] font-black uppercase tracking-wide text-[#8CA0C0]">Delivery</p>
                  <p className="mt-1 text-sm font-semibold text-[#071225]">Standard · 3-5 business days</p>
                </div>

                <p className="mt-6 text-[34px] font-black leading-none tracking-[-0.04em] text-[#071225]">
                  {formatNaira(price)}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Link
                    href="/parts"
                    className="flex h-12 items-center justify-center rounded-[10px] bg-[#FFF3D6] text-[13px] font-black text-[#E48700] hover:bg-[#FFE8AC]"
                  >
                    ← Back to Parts
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
        itemName={title}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
