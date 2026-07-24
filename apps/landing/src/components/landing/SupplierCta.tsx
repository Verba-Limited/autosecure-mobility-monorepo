import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const BULLETS = [
  "No setup fees",
  "Live in <1 hour",
  "Direct WhatsApp leads",
  "Full analytics dashboard",
];

export function SupplierCta() {
  return (
    <section id="suppliers" className="bg-white px-6 py-16 lg:px-8">
      <ScrollReveal
        className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#111B30] px-8 py-12 sm:px-14 sm:py-16"
        variant="zoom-in"
      >
        <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-gold-400">
              For Dealers &amp; Suppliers
            </span>
            <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              List Your Vehicles
              <br />
              &amp; Parts on <span className="text-gold-500">autoSecure</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/55">
              Join 400+ trusted dealers already on our platform. Upload your
              inventory in minutes and start receiving qualified WhatsApp
              inquiries immediately — zero commission on your first 10 listings.
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-white/60">
              {BULLETS.map((bullet) => (
                <li key={bullet} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-gold-500" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-col">
            <a
              href="#suppliers"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gold-500 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-gold-400"
            >
              Access Supplier Portal
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#suppliers"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl border border-white/15 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/5"
            >
              Learn More
            </a>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
