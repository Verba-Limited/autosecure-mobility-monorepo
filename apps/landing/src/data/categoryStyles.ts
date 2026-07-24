import type { CarCategory } from "@/data/cars";

export const CATEGORY_STYLES: Record<
  CarCategory,
  { badge: string; tag: string }
> = {
  Sedan: {
    badge: "bg-[#2454D6] text-white",
    tag: "bg-[#EEF3FF] text-[#2454D6]",
  },
  SUV: {
    badge: "bg-[#12A990] text-white",
    tag: "bg-[#E8FFF7] text-[#12A990]",
  },
  Sports: {
    badge: "bg-[#EF3D48] text-white",
    tag: "bg-[#FFF0F2] text-[#EF3D48]",
  },
  Electric: {
    badge: "bg-[#10B981] text-white",
    tag: "bg-[#E7FFF3] text-[#10B981]",
  },
  Truck: {
    badge: "bg-[#E71F51] text-white",
    tag: "bg-[#FFF0F4] text-[#E71F51]",
  },
};

export function getCategoryStyles(category: CarCategory) {
  return CATEGORY_STYLES[category];
}

export const CATEGORY_FILTERS: ("All" | CarCategory | "Used Cars")[] = [
  "All",
  "SUV",
  "Sedan",
  "Sports",
  "Electric",
  "Truck",
  "Used Cars",
];
