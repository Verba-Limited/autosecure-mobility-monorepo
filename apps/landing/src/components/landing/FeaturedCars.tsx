import { ArrowRight, Camera, MessageCircle } from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type Car = {
  badge: string;
  badgeClassName: string;
  brand: string;
  model: string;
  specs: { label: string; value: string }[];
  price: string;
  image: string;
};

const CARS: Car[] = [
  {
    badge: "New 2025",
    badgeClassName: "bg-[#17284A] text-white",
    brand: "BMW",
    model: "5 Series 530i",
    image: "/images/cars/vichcle4.jpg",
    specs: [
      { label: "Power", value: "248hp" },
      { label: "0–100", value: "6.1s" },
      { label: "Gearbox", value: "Auto" },
    ],
    price: "\u20a645,000,000",
  },
  {
    badge: "Bestseller",
    badgeClassName: "bg-[#D39A2D] text-white",
    brand: "Land Rover",
    model: "Range Rover Sport",
    image: "/images/cars/vichcle3.jpg",
    specs: [
      { label: "Power", value: "395hp" },
      { label: "0–100", value: "5.4s" },
      { label: "Drive", value: "AWD" },
    ],
    price: "\u20a678,500,000",
  },
  {
    badge: "⚡ Electric",
    badgeClassName: "bg-[#079B74] text-white",
    brand: "Tesla",
    model: "Model S Plaid",
    image: "/images/cars/vichicle2.jpg",
    specs: [
      { label: "Power", value: "1,020hp" },
      { label: "0–100", value: "2.1s" },
      { label: "Range", value: "637km" },
    ],
    price: "\u20a695,000,000",
  },
];

const PRICING_TABS = ["Outright", "Finance", "Lease"];

export function FeaturedCars() {
  return (
    <section id="new-cars" className="bg-white px-6 py-24 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center rounded-full bg-cream-100 px-4 py-1.5 text-xs font-semibold text-gold-600">
              Just Arrived
            </span>
            <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-navy-900 sm:text-5xl">
              Featured <span className="text-gold-500">New Cars</span>
            </h2>
          </div>
          <a
            href="#new-cars"
            className="inline-flex items-center gap-2 rounded-full border border-navy-900/15 px-5 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-900/[0.03]"
          >
            View Full Catalogue
            <ArrowRight className="h-4 w-4" />
          </a>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {CARS.map((car, index) => (
            <ScrollReveal
              key={car.model}
              className="overflow-hidden rounded-2xl border border-navy-900/10"
              delay={index * 120}
            >
              <div className="relative">
                <ImagePlaceholder
                  label={`${car.brand} ${car.model}`}
                  className="h-48 w-full"
                  src={car.image}
                />
                <span
                  className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase leading-none ${car.badgeClassName}`}
                >
                  {car.badge}
                </span>
                <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md bg-white/90">
                  <Camera className="h-3.5 w-3.5 text-navy-900" />
                </span>
              </div>

              <div className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-navy-900/45">
                  {car.brand}
                </p>
                <p className="text-lg font-bold text-navy-900">{car.model}</p>

                <div className="mt-4 grid grid-cols-3 gap-2 border-y border-navy-900/10 py-3 text-center">
                  {car.specs.map((spec) => (
                    <div key={spec.label}>
                      <p className="text-sm font-bold text-navy-900">
                        {spec.value}
                      </p>
                      <p className="text-[10px] uppercase tracking-wide text-navy-900/40">
                        {spec.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  {PRICING_TABS.map((tab, i) => (
                    <button
                      key={tab}
                      type="button"
                      className={`rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                        i === 0
                          ? "bg-navy-900 text-white"
                          : "bg-navy-900/[0.04] text-navy-900/60 hover:bg-navy-900/10"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <p className="mt-4 text-xl font-extrabold text-navy-900">
                  {car.price}
                </p>
                <p className="-mt-0.5 text-[11px] text-navy-900/40">
                  full price
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <a
                    href="#new-cars"
                    className="rounded-xl bg-navy-900/[0.05] py-2.5 text-center text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-900/10"
                  >
                    Details
                  </a>
                  <a
                    href="#new-cars"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366] py-1 text-sm font-semibold text-white transition-colors hover:bg-brand-green-600"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
