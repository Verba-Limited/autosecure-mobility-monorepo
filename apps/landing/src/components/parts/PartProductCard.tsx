"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { PartProduct } from "@/data/parts";
import { inquirePart, extractWhatsappLink, buildWhatsappUrl } from "@/lib/catalog-api";
import { InquireModal } from "@/components/ui/InquireModal";

function formatNaira(value?: number) {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return "N/A";
  }
  return `₦${Number(value).toLocaleString("en-NG")}`;
}

export function PartProductCard({ product }: { product: PartProduct }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasRealId = /^[0-9a-fA-F]{24}$/.test(product.id) || !product.id.includes("-");

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
      <article className="group overflow-hidden rounded-[18px] border border-white/8 bg-[#0d0d0d] transition-all duration-300 hover:border-amber-400/30 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.7)]">
        <div className="relative flex h-[170px] items-center justify-center bg-[#141414] border-b border-white/6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
          <span
            className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1.5 text-[11px] font-black uppercase leading-none ${product.badgeClassName}`}
          >
            {product.badge}
          </span>
          {product.tag && (
            <span
              className={`absolute right-4 top-4 z-10 rounded-full px-3 py-1.5 text-[10px] font-black uppercase leading-none ${product.tagClassName}`}
            >
              {product.tag}
            </span>
          )}

          <Image
            src={product.image}
            alt={product.name}
            width={80}
            height={80}
            className="h-20 w-20 object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:scale-110 sm:h-20 sm:w-20"
          />
        </div>

        <div className="p-5">
          <p className="text-[11px] font-black uppercase tracking-wide text-amber-400">
            {product.category}
          </p>
          <h2 className="mt-1 text-[15px] font-extrabold leading-tight text-white">
            {product.name}
          </h2>
          <p className="mt-3 min-h-[50px] text-[13px] font-normal leading-6 text-white/40">
            {product.description}
          </p>

          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold text-white/30">
                Standard · 3-5 days
              </p>
              <p className="mt-1 text-[22px] font-black leading-none tracking-[-0.04em] text-white">
                {formatNaira(product.price)}
              </p>
            </div>
            <div className="flex items-center gap-1 text-[13px] font-black text-amber-400">
              <span>★★★★★</span>
              <span className="text-[11px] font-semibold text-white/30">
                ({product.ratingCount})
              </span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {hasRealId ? (
              <Link
                href={`/parts/${product.id}`}
                className="flex h-10 items-center justify-center rounded-lg border border-amber-400/25 bg-amber-400/10 text-[13px] font-black text-amber-400 transition-all hover:bg-amber-400/20 hover:border-amber-400/40"
              >
                View Details
              </Link>
            ) : (
              <Link
                href="/parts"
                className="flex h-10 items-center justify-center rounded-lg border border-white/8 bg-white/5 text-[13px] font-black text-white/40 transition-all hover:bg-white/8 hover:text-white/60"
              >
                Browse All
              </Link>
            )}
            <button
              type="button"
              id={`whatsapp-part-${product.id}`}
              onClick={() => setModalOpen(true)}
              className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#25D366] text-[13px] font-black text-black transition-colors hover:bg-[#20BD5A]"
            >
              <MessageCircle className="h-4 w-4" fill="currentColor" />
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
