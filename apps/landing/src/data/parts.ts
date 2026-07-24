export type PartCategory =
  | "Engine Parts"
  | "Wheels & Tyres"
  | "Brakes"
  | "Exhaust"
  | "Lighting"
  | "Suspension"
  | "Interior"
  | "Body Kits";

export type DeliveryOption = {
  colorClassName: string;
  description: string;
  title: string;
};

export type PartProduct = {
  id: string;
  badge: string;
  badgeClassName: string;
  category: PartCategory;
  description: string;
  imageToneClassName: string;
  name: string;
  price: number;
  ratingCount: number;
  tag?: string;
  tagClassName?: string;
  /** Path to the product photo in /public, e.g. "/images/parts/alloy-wheel-set.jpg" */
  image: string;
};

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    colorClassName: "bg-[#EF4444]",
    description: "+30% premium, arrives tomorrow",
    title: "Next-Day Delivery",
  },
  {
    colorClassName: "bg-[#2454D6]",
    description: "Base price, arrives in 3-5 days",
    title: "Standard Delivery",
  },
  {
    colorClassName: "bg-[#12A990]",
    description: "-15% discount, arrives in 7-14 days",
    title: "Economy Delivery",
  },
];

export const PART_CATEGORIES = [
  "All Parts",
  "Engine Parts",
  "Wheels & Tyres",
  "Brakes",
  "Exhaust",
  "Lighting",
  "Suspension",
  "Interior",
  "Body Kits",
] as const;

export const PART_PRODUCTS: PartProduct[] = [
  {
    id: "alloy-wheel-set",
    badge: "Popular",
    badgeClassName: "bg-[#F59E0B] text-white",
    category: "Wheels & Tyres",
    description:
      "Forged aluminum alloy. Fits BMW 3, 5 Series | Benz C, E Class",
    imageToneClassName: "bg-[#FFF2D8]",
    name: '18" Alloy Wheel Set (4pc)',
    price: 243_000,
    ratingCount: 128,
    tag: "OEM Spec",
    tagClassName: "bg-white text-[#F59E0B]",
    image: "/images/icons/⚙️.png", // TODO: update to your actual path
  },
  {
    id: "carbon-fibre-spoiler",
    badge: "Limited",
    badgeClassName: "bg-[#EF4444] text-white",
    category: "Body Kits",
    description:
      "Real carbon fibre. Universal fitment for most sedans and coupes.",
    imageToneClassName: "bg-[#243145]",
    name: "Carbon Fibre Trunk Spoiler",
    price: 87_500,
    ratingCount: 64,
    tag: "Carbon Fibre",
    tagClassName: "bg-white/15 text-white",
    image: "/images/icons/🏎️.png", // TODO: update to your actual path
  },
  {
    id: "matrix-led-headlight",
    badge: "Bestseller",
    badgeClassName: "bg-[#2454D6] text-white",
    category: "Lighting",
    description:
      "6000K ultra-bright. Plug & play for Toyota, Honda, Hyundai models.",
    imageToneClassName: "bg-[#D7EAFE]",
    name: "Matrix LED Headlight Set",
    price: 156_000,
    ratingCount: 212,
    image: "/images/icons/💡.png", // TODO: update to your actual path
  },
  {
    id: "performance-brake-kit",
    badge: "Safety",
    badgeClassName: "bg-[#EF4444] text-white",
    category: "Brakes",
    description:
      "Drilled & slotted rotors + ceramic pads. Fits most European sedans.",
    imageToneClassName: "bg-[#FFE1E5]",
    name: "Performance Brake Kit (Front)",
    price: 112_000,
    ratingCount: 89,
    image: "/images/icons/🛞.png", // TODO: update to your actual path
  },
  {
    id: "stainless-cat-back-exhaust",
    badge: "Performance",
    badgeClassName: "bg-[#059669] text-white",
    category: "Exhaust",
    description:
      "304-grade stainless steel. Fits Honda Civic, Toyota Corolla (2018+)",
    imageToneClassName: "bg-[#D8F9E3]",
    name: "Stainless Cat-Back Exhaust",
    price: 195_000,
    ratingCount: 47,
    image: "/images/icons/💨.png", // TODO: update to your actual path
  },
  {
    id: "coilover-suspension-kit",
    badge: "Handling",
    badgeClassName: "bg-[#7C3AED] text-white",
    category: "Suspension",
    description:
      "Height-adjustable 32-way damping. Universal fitment, 3yr warranty.",
    imageToneClassName: "bg-[#F0DFFF]",
    name: "Coilover Suspension Kit",
    price: 385_000,
    ratingCount: 73,
    image: "/images/icons/🔩.png", // TODO: update to your actual path
  },
];
