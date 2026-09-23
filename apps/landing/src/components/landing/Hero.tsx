import { ArrowRight, Check, Zap } from "lucide-react";
import Link from "next/link";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const STATS = [
  {
    value: "500",
    accent: "+",
    label: "Cars Listed",
  },
  {
    value: "1,200",
    accent: "+",
    label: "Parts Available",
  },
  {
    value: "98",
    accent: "%",
    label: "Satisfaction",
  },
  {
    value: "<2",
    accent: "min",
    label: "Avg. Response",
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#242424]">
      {/* Background grid texture */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(201,148,58,0.06) 0%, transparent 60%),
            radial-gradient(circle at 80% 20%, rgba(201,148,58,0.04) 0%, transparent 50%)`,
        }}
      />

      {/* Subtle grid lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-2 lg:items-center lg:px-16 lg:py-28">
        {/* Left: copy */}
        <ScrollReveal variant="fade-right">
          {/* <span className="landing-kicker inline-flex items-center gap-2.5 text-[#C9943A]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C9943A]" />
            Nigeria&apos;s Premier Automotive Platform
          </span> */}

          <h1 className="mt-6 max-w-[720px] text-5xl leading-[1.03] text-white sm:text-[72px]">
            Drive Bold.
            <br />
            Buy <span className="text-[#C9943A]">Secured.</span>
            <br />
            Own Smart.
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-white/45">
            Discover brand-new cars, certified used vehicles, and premium
            aftermarket parts — all verified, all in one place. Connect with
            trusted dealers instantly via WhatsApp.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/new-cars"
              className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-[#C9943A] px-6 py-3.5 text-sm font-bold text-black transition-all hover:bg-[#E0AE5A] shadow-[0_8px_24px_rgba(201,148,58,0.35)]"
            >
              Browse New Cars
            </Link>
            <Link
              href="/used-cars/"
              className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-white/25"
            >
              View Used Deals
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <dl className="mt-12 grid grid-cols-4 divide-x divide-white/8">
            {STATS.map((stat) => (
              <div key={stat.label} className="pr-4 first:pl-0">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-xl font-black leading-none text-white sm:text-2xl">
                  {stat.value}
                  <span className="ml-0.5 text-base text-[#C9943A]">
                    {stat.accent}
                  </span>
                </dd>
                <dd className="mt-1 text-[11px] font-semibold leading-tight text-white/35">
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
          <div className="absolute -top-16 left-2 z-20 flex items-center gap-2.5 rounded-2xl border border-white/10 bg-[#303030]/95 px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md sm:-left-8">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600">
                <Check className="h-4 w-4 text-white" strokeWidth={3.5} />
              </span>
            </div>
            <div className="leading-tight">
              <p className="text-[12px] font-semibold text-white/40">
                Supplier Status
              </p>
              <p className="text-[15px] font-black text-emerald-400">
                Verified & Certified
              </p>
            </div>
          </div>

          {/* Main card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/8 shadow-[0_32px_64px_rgba(0,0,0,0.8)]">
            <ImagePlaceholder
              label="BMW 5 Series 530i — hero shot"
              src="/images/cars/featured-car.jpg"
              tone="dark"
              className="aspect-3/2 w-full"
              objectFit="cover"
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
              <span className="rounded-md bg-[#242424]/75 px-2.5 py-1 text-[12px] font-bold uppercase tracking-wide text-white/70 backdrop-blur-sm border border-white/10">
                Featured Vehicle
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-[#C9943A]/30 bg-[#C9943A]/15 px-2.5 py-1 text-[11px] font-semibold text-[#E0AE5A] backdrop-blur-sm">
                ⭐ Top Pick
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-lg font-bold text-white">BMW 5 Series 530i</p>
              <p className="mt-0.5 text-xs text-white/40">
                Brand New · 8 Colors Available
              </p>
              <Link
                href="/new-cars"
                className="mt-4 block rounded-[11px] bg-[#C9943A] py-2.5 text-center text-sm font-bold text-black transition-colors hover:bg-[#E0AE5A] shadow-[0_4px_16px_rgba(201,148,58,0.4)]"
              >
                View Details
              </Link>
            </div>
          </div>

          {/* New this week badge */}
          <div className="absolute -left-4 top-1/3 z-20 rounded-2xl border border-white/10 bg-[#303030]/95 px-4 py-3 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.35)] sm:-left-16">
            <p className="text-[11px] text-white/40">New This Week</p>
            <p className="text-[28px] font-black text-[#C9943A]">+24</p>
          </div>

          {/* Response time badge */}
          <div className="absolute -bottom-10 -right-2 z-20 max-w-52 rounded-2xl border border-white/10 bg-[#303030]/95 px-3 py-3 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.35)] sm:-right-4">
            <p className="text-[10px] font-semibold leading-snug text-white/40">
              Avg. Response via WhatsApp
            </p>
            <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-bold">
              <Zap className="h-4 w-4 text-[#C9943A] fill-[#C9943A]" />
              <span className="text-emerald-400 font-black text-[16px]">
                &lt;2 Minutes
              </span>
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-white/35">
              Available 8am–10pm daily
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
