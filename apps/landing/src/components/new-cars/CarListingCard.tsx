import Image from "next/image";
import { MessageCircle, Play } from "lucide-react";
import { getCategoryStyles } from "@/data/categoryStyles";
import type { Car } from "@/data/cars";

const PRICING_TABS = ["Outright", "Finance", "Lease"];

function formatNaira(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

export function CarListingCard({ car }: { car: Car }) {
  const styles = getCategoryStyles(car.category);

  return (
    <article
      id={car.id}
      className="overflow-hidden rounded-[18px] border border-[#DDE6F2] bg-white shadow-[0_10px_30px_rgba(15,27,61,0.04)]"
    >
      <div className="relative h-[198px] overflow-hidden bg-[#EEF3F8]">
        <Image
          src={car.image}
          alt={car.imageLabel}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 378px, (min-width: 640px) 50vw, 100vw"
        />
        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-[12px] font-black uppercase leading-none ${styles.badge}`}
        >
          {car.badgeLabel}
        </span>
        {car.hasVideo && (
          <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-[8px] bg-white/95 shadow-sm">
            <Play
              className="h-4 w-4 text-[#8BA0BF]"
              fill="currentColor"
              strokeWidth={2.5}
            />
          </span>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-black uppercase tracking-wide text-[#8CA0C0]">
              {car.brand}
            </p>
            <h2 className="mt-1 text-[21px] font-black leading-tight text-[#071225]">
              {car.model}
            </h2>
          </div>
          <span
            className={`mt-1 shrink-0 rounded-md px-2.5 py-1.5 text-[11px] font-black uppercase leading-none ${styles.tag}`}
          >
            {car.category}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-3 border-y border-[#E6EDF6] py-3.5 text-center">
          {car.specs.map((spec, index) => (
            <div
              key={spec.label}
              className={index > 0 ? "border-l border-[#E6EDF6]" : undefined}
            >
              <p className="text-[13px] font-black leading-tight text-[#071225]">
                {spec.value}
              </p>
              <p className="mt-1 text-[10px] font-semibold leading-tight text-[#A0AEC7]">
                {spec.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-1.5">
          {PRICING_TABS.map((tab, index) => (
            <button
              key={tab}
              type="button"
              className={`h-8 rounded-[7px] text-[11px] font-black transition-colors ${
                index === 0
                  ? "bg-[#2454D6] text-white"
                  : "border border-[#DDE6F2] bg-white text-[#7788A8] hover:bg-[#F6F8FC]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-end gap-2">
          <p className="text-[28px] font-black leading-none tracking-[-0.04em] text-[#071225]">
            {formatNaira(car.price)}
          </p>
          <p className="pb-0.5 text-[11px] font-semibold text-[#8CA0C0]">
            full price
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <a
            href={`#${car.id}`}
            className="flex h-11 items-center justify-center rounded-[8px] bg-[#EEF3FF] text-[13px] font-black text-[#2454D6] transition-colors hover:bg-[#E0E9FF]"
          >
            View Details
          </a>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Hi, I'm interested in the ${car.brand} ${car.model} listed on autoSecure Mobility.`,
            )}`}
            className="flex h-11 items-center justify-center gap-1.5 rounded-[8px] bg-[#25D366] text-[13px] font-black text-white transition-colors hover:bg-[#20BD5A]"
          >
            <MessageCircle className="h-3.5 w-3.5" fill="currentColor" />
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
