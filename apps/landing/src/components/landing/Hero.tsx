import { ArrowRight, Check, Star, Zap } from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const STATS = [
  {
    value: "500",
    accent: "+",
    label: "Cars Listed",
    valueClassName: "text-[#1C2B4A]",
    accentClassName: "text-[#C9943A]",
  },
  {
    value: "1,200",
    accent: "+",
    label: "Parts Available",
    valueClassName: "text-[#C9943A]",
    accentClassName: "text-[#C9943A]",
  },
  {
    value: "98",
    accent: "%",
    label: "Satisfaction",
    valueClassName: "text-[#1C2B4A]",
    accentClassName: "text-[#C9943A]",
  },
  {
    value: "<2",
    accent: "min",
    label: "Avg. Response",
    valueClassName: "text-[#1C2B4A]",
    accentClassName: "text-[#C9943A]",
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to- from-[#F0F4FF] via-[#FFFFFF] to-[#F0FDFA]">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-2 lg:items-center lg:px-16 lg:py-28">
        {/* Left: copy */}
        <ScrollReveal variant="fade-right">
          <span className="inline-flex items-center rounded-full gap-3 bg-cream-100 px-4 py-1.5 text-xs font-bold text-[#C9943A]">
            <span className="bg-[#C9943A] h-[7.92px] w-[7.92px] rounded-[3.96px]"></span>
            Nigeria&apos;s Premier Automotive Platform
          </span>

          <h1 className="mt-6 text-5xl font-black leading-16 md:leading-[84.75px] tracking-[-2.83px] text-[#1C2B4A] sm:text-[81.49px] ">
            Drive Bold.
            <br />
            Buy <span className="text-gold-500">Secured.</span>
            <br />
            Own Smart.
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-navy-900/60">
            Discover brand-new cars, certified used vehicles, and premium
            aftermarket parts — all verified, all in one place. Connect with
            trusted dealers instantly via WhatsApp.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#new-cars"
              className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-gold-500 px-6 py-3.5 text-sm font-semibold text-[white] transition-colors hover:bg-gold-400"
            >
              🚗 Browse New Cars
            </a>
            <a
              href="/used-cars"
              className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-[#E2E8F0] px-6 py-3.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-900/[0.03]"
            >
              View Used Deals
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <dl className="mt-12 grid grid-cols-4 divide-x divide-navy-900/10">
            {STATS.map((stat) => (
              <div key={stat.label} className="pr-4 first:pl-0">
                <dt className="sr-only">{stat.label}</dt>
                <dd
                  className={`text-xl font-black leading-none sm:text-2xl ${stat.valueClassName}`}
                >
                  {stat.value}
                  <span className={`ml-0.5 text-base ${stat.accentClassName}`}>
                    {stat.accent}
                  </span>
                </dd>
                <dd className="mt-1 text-[11px] font-semibold leading-tight text-[#4D5F7C]">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </ScrollReveal>

        {/* Right: featured vehicle mockup */}
        <ScrollReveal
          className="relative mx-auto w-full max-w-md lg:mx-0 lg:ml-auto md:space-y-0 space-y-5"
          delay={140}
          variant="fade-left"
        >
          {/* Supplier status badge */}
          <div className="absolute -top-18.5 left-2 z-20 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-lg shadow-navy-900/10 sm:-left-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#10B9811F]">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-green-600">
                <Check className="h-4 w-4 text-white" strokeWidth={3.5} />
              </span>
            </div>
            <div className="leading-tight ">
              <p className="text-[12px] font-semibold text-[#6B7A9A]">
                Supplier Status
              </p>
              <p className="text-[16px] font-black text-[#059669]">
                Verified &amp; Certified
              </p>
            </div>
          </div>

          {/* Main card */}
          <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-navy-900/20">
            <ImagePlaceholder
              label="BMW 5 Series 530i — hero shot"
              src="/images/cars/featured-car.jpg"
              tone="dark"
              className="aspect-3/2 w-full"
            />

            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
              <span className="rounded-md bg-black/30 px-2.5 py-1 text-[13px] font-bold uppercase tracking-wide text-white/40 backdrop-blur">
                Featured Vehicle
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-[#C9943A33] px-2.5 py-1 text-[10px] font-semibold text-[#E0AE5A]">
                ⭐ Top Pick
              </span>
            </div>

            <div className="absolute top-3 inset-x-0 bottom-0  to-transparent p-5 pt-16">
              <p className="text-lg font-bold text-white">BMW 5 Series 530i</p>
              <p className="mt-0.5 text-xs text-white/50">
                Brand New · 8 Colors Available
              </p>
            </div>
            <div className="absolute inset-x-0 bottom-0  p-5 pt-16">
              <a
                href="#new-cars"
                className="mt-4 block w-80 rounded-[11.32px] bg-gold-500 py-2.5 text-center text-sm font-semibold text-[white] transition-colors hover:bg-gold-400"
              >
                View Details
              </a>
            </div>
          </div>

          {/* New this week badge */}
          <div className="absolute -left-4 top-1/3 z-20 rounded-2xl bg-white w-40 h-20 px-4 py-3 shadow-lg shadow-navy-900/10 sm:-left-16">
            <p className="text-[11px] text-navy-900/50">New This Week</p>
            <p className="text-[29.43px] font-black text-gold-600">+24</p>
          </div>

          {/* Response time badge */}
          <div className="absolute -bottom-10 -right-2 z-20 max-w-52 rounded-2xl bg-white px-3 py-3 shadow-lg shadow-navy-900/10 sm:-right-4">
            <p className="mt-0.5 text-[10px] font-semibold leading-snug text-[#6B7A9A]">
              {" "}
              Avg. Response via WhatsApp{" "}
            </p>
            <p className="inline-flex items-center gap-1 text-sm font-bold text-gold-600">
              <Zap className="h-4 w-4 fill-gold-600" />
              <span className="text-[#10B981] font-black text-[16px]">
                &lt;2 Minutes
              </span>
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-[#6B7A9A]">
              Available 8am–10pm daily
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
