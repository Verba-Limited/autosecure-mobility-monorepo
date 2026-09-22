import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  {
    id: "brand-new-cars",
    label: "BRAND NEW CARS",
    sublabel: "Factory-fresh from top global manufacturers",
    href: "/new-cars",
    stat: "250+ Models",
    emoji: "🚗",
    gradient: "from-[#C9943A]/20 via-transparent to-transparent",
    accentColor: "#C9943A",
    borderColor: "border-[#C9943A]/20",
    hoverBorder: "hover:border-[#C9943A]/50",
    ctaClass:
      "bg-[#C9943A] text-black hover:bg-[#E0AE5A] shadow-[0_4px_20px_rgba(201,148,58,0.35)]",
    statClass: "text-[#C9943A]",
  },
  {
    id: "used-cars",
    label: "USED CARS",
    sublabel: "Certified pre-owned with inspection reports",
    href: "/used-cars",
    stat: "180+ Listings",
    emoji: "🔑",
    gradient: "from-emerald-500/15 via-transparent to-transparent",
    accentColor: "#10B981",
    borderColor: "border-emerald-500/20",
    hoverBorder: "hover:border-emerald-500/40",
    ctaClass:
      "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_4px_20px_rgba(16,185,129,0.3)]",
    statClass: "text-emerald-400",
  },
  {
    id: "auto-parts",
    label: "AUTO PARTS",
    sublabel: "OEM & performance parts with fast delivery",
    href: "/parts",
    stat: "1,200+ Parts",
    emoji: "⚙️",
    gradient: "from-blue-500/15 via-transparent to-transparent",
    accentColor: "#3B82F6",
    borderColor: "border-blue-500/20",
    hoverBorder: "hover:border-blue-500/40",
    ctaClass:
      "bg-blue-500 text-white hover:bg-blue-400 shadow-[0_4px_20px_rgba(59,130,246,0.3)]",
    statClass: "text-blue-400",
  },
];

export function CategoryHero() {
  return (
    <section className="bg-[#292929] px-6 py-20 lg:px-16">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#C9943A]/20 bg-[#C9943A]/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-[#C9943A]">
            Explore Our Platform
          </span>
          <h2 className="mt-5 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
            What are you looking for?
          </h2>
          <p className="mt-3 text-base text-white/40">
            Discover, compare, and purchase — all in one automotive platform.
          </p>
        </div>

        {/* Category cards */}
        <div className="grid gap-5 lg:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border ${cat.borderColor} ${cat.hoverBorder} bg-[#363636] p-8 transition-all duration-300 hover:bg-[#3c3c3c] hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(0,0,0,0.25)]`}
            >
              {/* Gradient glow */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-60 transition-opacity duration-300 group-hover:opacity-100`}
              />

              {/* Content */}
              <div className="relative">
                {/* Emoji + stat */}
                <div className="flex items-start justify-between">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-[32px] transition-transform duration-300 group-hover:scale-110">
                    {cat.emoji}
                  </span>
                  <span className={`text-[13px] font-black ${cat.statClass}`}>
                    {cat.stat}
                  </span>
                </div>

                {/* Label */}
                <p className="mt-6 text-[11px] font-black tracking-[0.2em] text-white/30">
                  {/* CATEGORY */}
                </p>
                <h3 className="mt-2 text-[26px] font-black leading-none text-white">
                  {cat.label}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/45">
                  {cat.sublabel}
                </p>

                {/* CTA */}
                <div
                  className={`mt-8 inline-flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-[13px] font-bold transition-all ${cat.ctaClass}`}
                >
                  Shop Now
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
