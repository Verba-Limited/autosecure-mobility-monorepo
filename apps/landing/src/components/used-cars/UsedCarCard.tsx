import Image from "next/image";
import { Check, MessageCircle, Play } from "lucide-react";
import type { UsedCar } from "@/data/usedCars";

const CATEGORY_STYLES: Record<UsedCar["category"], string> = {
  Hybrid: "bg-[#E8FFF7] text-[#10B981]",
  Sedan: "bg-[#EEF3FF] text-[#2454D6]",
  SUV: "bg-[#FFF3E8] text-[#F97316]",
};

const CONDITION_STYLES: Record<UsedCar["condition"], string> = {
  Excellent: "text-[#10B981]",
  "Like New": "text-[#10B981]",
  Good: "text-[#E48700]",
};

function formatNaira(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

export function UsedCarCard({ car }: { car: UsedCar }) {
  return (
    <article
      id={car.id}
      className="overflow-hidden rounded-[18px] border border-[#DDE6F2] bg-white shadow-[0_10px_30px_rgba(15,27,61,0.04)]"
    >
      <div className="relative h-[198px] overflow-hidden bg-[#EEF3F8]">
        <Image
          src={car.image}
          alt={`${car.brand} ${car.model}`}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 378px, (min-width: 640px) 50vw, 100vw"
        />
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
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-black uppercase leading-none text-[#10B981]"
            >
              <Check className="h-3 w-3" strokeWidth={3} />
              {badge}
            </span>
          ))}
        </div>
        <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-[8px] bg-white/95 shadow-sm">
          <Play
            className="h-4 w-4 text-[#8BA0BF]"
            fill="currentColor"
            strokeWidth={2.5}
          />
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-black uppercase tracking-wide text-[#8CA0C0]">
              {car.brand} · {car.year}
            </p>
            <h2 className="mt-1 text-[19px] font-extrabold leading-tight text-[#0A0F1E]">
              {car.model}
            </h2>
          </div>
          <span
            className={`mt-1 shrink-0 rounded-md px-2.5 py-1.5 text-[11px] font-black uppercase leading-none ${CATEGORY_STYLES[car.category]}`}
          >
            {car.category}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-3 border-y border-[#E6EDF6] py-3.5 text-center">
          <div>
            <p className="text-[13px] font-black leading-tight text-[#071225]">
              {car.mileage}
            </p>
            <p className="mt-1 text-[10px] font-semibold leading-tight text-[#A0AEC7]">
              Mileage
            </p>
          </div>
          <div className="border-l border-[#E6EDF6]">
            <p className="text-[13px] font-black leading-tight text-[#071225]">
              {car.fuelType}
            </p>
            <p className="mt-1 text-[10px] font-semibold leading-tight text-[#A0AEC7]">
              Fuel Type
            </p>
          </div>
          <div className="border-l border-[#E6EDF6]">
            <p
              className={`text-[13px] font-black leading-tight ${CONDITION_STYLES[car.condition]}`}
            >
              {car.condition}
            </p>
            <p className="mt-1 text-[10px] font-semibold leading-tight text-[#A0AEC7]">
              Condition
            </p>
          </div>
        </div>

        <div className="mt-4 min-h-[52px]">
          {car.originalPrice && (
            <p className="text-[12px] font-semibold text-[#A0AEC7] line-through">
              {formatNaira(car.originalPrice)}
            </p>
          )}
          <div className="flex items-end gap-2">
            <p className="text-[26px] font-black leading-none tracking-[-0.04em] text-[#0A0F1E]">
              {formatNaira(car.price)}
            </p>
            {car.originalPrice && (
              <span className="rounded-md bg-[#FFF0F2] px-2 py-1 text-[11px] font-black text-[#EF3D48]">
                SALE
              </span>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <a
            href={`#${car.id}`}
            className="flex h-11 items-center justify-center rounded-[8px] border border-[#BDEFE4] bg-[#F0FFFC] text-[13px] font-black text-[#0F9F8A] transition-colors hover:bg-[#E0FAF4]"
          >
            View Details
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Hi, I'm interested in the ${car.brand} ${car.model} used car listed on autoSecure Mobility.`,
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
