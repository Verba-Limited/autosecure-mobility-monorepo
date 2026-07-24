import { MessageCircle } from "lucide-react";
import Image from "next/image";
import type { PartProduct } from "@/data/parts";

function formatNaira(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

export function PartProductCard({ product }: { product: PartProduct }) {
  return (
    <article className="overflow-hidden rounded-[18px] border border-[#DDE6F2] bg-white shadow-[0_10px_30px_rgba(15,27,61,0.03)]">
      <div
        className={`relative flex h-[170px] items-center justify-center ${product.imageToneClassName}`}
      >
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
          className="h-20 w-20 object-contain drop-shadow-[0_10px_10px_rgba(15,27,61,0.22)] sm:h-20 sm:w-20"
        />
      </div>

      <div className="p-5">
        <p className="text-[11px] font-black uppercase tracking-wide text-[#E48700]">
          {product.category}
        </p>
        <h2 className="mt-1 text-[15px] font-extrabold leading-tight text-[#0A0F1E]">
          {product.name}
        </h2>
        <p className="mt-3 min-h-[50px] text-[13px] font-normal leading-6 text-[#7B8DB0]">
          {product.description}
        </p>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold text-[#8CA0C0]">
              Standard · 3-5 days
            </p>
            <p className="mt-1 text-[22px] font-black leading-none tracking-[-0.04em] text-[#0A0F1E]">
              {formatNaira(product.price)}
            </p>
          </div>
          <div className="flex items-center gap-1 text-[13px] font-black text-[#F59E0B]">
            <span>★★★★★</span>
            <span className="text-[11px] font-semibold text-[#8CA0C0]">
              ({product.ratingCount})
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_82px] gap-0">
          <button
            type="button"
            className="flex h-10 items-center justify-center rounded-lg bg-[#F59E0B] text-[13px] font-black text-white shadow-[0_10px_18px_rgba(245,158,11,0.22)] transition-colors hover:bg-[#E48700]"
          >
            Add to Cart
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Hi, I'm interested in ${product.name} on autoSecure Mobility.`,
            )}`}
            className="flex h-10 items-center justify-center rounded-lg bg-[#25D366] text-white transition-colors hover:bg-[#20BD5A]"
          >
            <MessageCircle className="h-4 w-4" fill="currentColor" />
          </a>
        </div>
      </div>
    </article>
  );
}
