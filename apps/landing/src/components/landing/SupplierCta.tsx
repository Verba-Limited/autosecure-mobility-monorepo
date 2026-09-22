import { Mail } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const BULLETS = [
  "Inventory-led enquiries",
  "Direct customer conversations",
  "Clear supplier onboarding",
  "A considered marketplace presence",
];

export function SupplierCta() {
  return (
    <section id="suppliers" className="bg-[#292929] px-6 py-16 lg:px-8">
      <ScrollReveal
        className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-[#393939] px-8 py-12 sm:px-14 sm:py-16"
        variant="zoom-in"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 50%, rgba(201,148,58,0.06) 0%, transparent 60%)",
          }}
        />
        {/* Gold line top */}
        <div className="mb-10 h-px w-full bg-gradient-to-r from-transparent via-[#C9943A]/30 to-transparent" />

        <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center rounded-full border border-[#C9943A]/20 bg-[#C9943A]/10 px-4 py-1.5 text-xs font-semibold text-[#C9943A]">
              A note for dealers &amp; suppliers
            </span>
            <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              Put your inventory in front of customers who are ready to decide.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/45">
              Bring your vehicles and parts into a marketplace built for
              discovery, considered comparison and direct, qualified customer
              conversations.
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-white/45">
              {BULLETS.map((bullet) => (
                <li key={bullet} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-[#C9943A]" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-col">
            <a
              href="mailto:hello@autosecure.ng?subject=Supplier%20portal%20access%20request"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#C9943A] px-6 py-3.5 text-sm font-bold text-black transition-all hover:bg-[#E0AE5A] shadow-[0_4px_20px_rgba(201,148,58,0.3)]"
            >
              Request Supplier Access
              {/* <Mail className="h-4 w-4" /> */}
            </a>
            <a
              href="mailto:hello@autosecure.ng?subject=Supplier%20onboarding%20question"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl border border-white/12 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
