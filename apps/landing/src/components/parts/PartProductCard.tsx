"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Truck } from "lucide-react";
import type { PartProduct } from "@/data/parts";
import {
  inquirePart,
  extractWhatsappLink,
  buildWhatsappUrl,
} from "@/lib/catalog-api";
import { InquireModal } from "@/components/ui/InquireModal";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

function formatNaira(value?: number | null) {
  if (
    value === undefined ||
    value === null ||
    value === 0 ||
    isNaN(Number(value))
  ) {
    return null;
  }
  return `₦${Number(value).toLocaleString("en-NG")}`;
}

export function PartProductCard({ product }: { product: PartProduct }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasRealId =
    /^[0-9a-fA-F]{24}$/.test(product.id) || !product.id.includes("-");
  const formattedPrice = formatNaira(product.price);

  async function handleInquire(data: {
    customerPhone: string;
    customerEmail: string;
  }) {
    setIsSubmitting(true);
    try {
      const res = await inquirePart(product.id, data);
      const link = extractWhatsappLink(
        res,
        `Hi, I'm interested in ${product.name} on autoSecure Mobility.`,
      );
      window.open(link, "_blank", "noopener,noreferrer");
      setModalOpen(false);
    } catch {
      window.open(
        buildWhatsappUrl(
          `Hi, I'm interested in ${product.name} on autoSecure Mobility.`,
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
      <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#0f0f0f] transition-all duration-300 hover:border-amber-400/25 hover:shadow-[0_24px_48px_rgba(0,0,0,0.7)] hover:-translate-y-1">
        {/* ── Image panel ── */}
        <div className="relative flex h-[190px] shrink-0 items-center justify-center overflow-hidden bg-gradient-to-b from-[#1a1a1a] to-[#111]">
          {/* Subtle radial glow behind image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-32 rounded-full bg-amber-400/5 blur-2xl" />
          </div>

          {/* Stock badge */}
          <span
            className={`absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${product.badgeClassName}`}
          >
            {product.badge}
          </span>

          {/* Brand / tag badge */}
          {product.tag && (
            <span
              className={`absolute right-3 top-3 z-10 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${product.tagClassName}`}
            >
              {product.tag}
            </span>
          )}

          {/* Product image */}
          <div className="relative z-10 transition-transform duration-500 group-hover:scale-110">
            <Image
              src={product.image}
              alt={product.name}
              width={96}
              height={96}
              className="h-24 w-24 object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.8)]"
            />
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0f0f0f] to-transparent" />
        </div>

        {/* ── Content panel ── */}
        <div className="flex flex-1 flex-col p-5">
          {/* Category */}
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-amber-400/80">
            {product.category}
          </p>

          {/* Name */}
          <h2 className="mt-1.5 text-[15px] font-extrabold leading-snug text-white">
            {product.name}
          </h2>

          {/* Description */}
          <p className="mt-2.5 line-clamp-2 text-[12.5px] leading-[1.65] text-white/35 flex-1">
            {product.description || "Quality aftermarket part"}
          </p>

          {/* Divider */}
          <div className="my-4 h-px bg-white/6" />

          {/* Price row */}
          <div>
              <div className="flex items-center gap-1.5 text-white/30">
                <Truck className="h-3 w-3" />
                <span className="text-[11px] font-semibold">
                  Standard · 3–5 days
                </span>
              </div>

              {formattedPrice ? (
                <p className="mt-1 text-[24px] font-black leading-none tracking-[-0.05em] text-white">
                  {formattedPrice}
                </p>
              ) : (
                <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg border border-amber-400/15 bg-amber-400/8 px-2.5 py-1">
                  <span className="text-[11px] font-bold text-amber-300/80">
                    Price on request
                  </span>
                </div>
              )}
            </div>

          {/* CTA buttons */}
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {hasRealId ? (
              <Link
                href={`/parts/${product.id}`}
                className="flex h-10 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/8 text-[12.5px] font-black text-amber-300 transition-all hover:border-amber-400/40 hover:bg-amber-400/15 hover:text-amber-200"
              >
                View Details
              </Link>
            ) : (
              <Link
                href="/parts"
                className="flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/4 text-[12.5px] font-black text-white/40 transition-all hover:bg-white/8 hover:text-white/60"
              >
                Browse All
              </Link>
            )}
            <button
              type="button"
              id={`whatsapp-part-${product.id}`}
              onClick={() => setModalOpen(true)}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#25D366] text-[12.5px] font-black text-black transition-all hover:bg-[#1db954] hover:shadow-[0_4px_16px_rgba(37,211,102,0.35)]"
            >
              <WhatsAppIcon className="h-3.5 w-3.5" />
              WhatsApp
            </button>
          </div>
        </div>
      </article>

      <InquireModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleInquire}
        itemName={product.name}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
