import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ImagePlaceholder } from "../ui/ImagePlaceholder";

type Point = {
  icon: string;
  title: string;
  description: string;
};

const POINTS: Point[] = [
  {
    icon: "/images/icons/%23L01f6e1%23Ufe0f.png",
    title: "Verified Suppliers",
    description:
      "Every dealer and supplier undergoes a rigorous verification process before listing. No fake listings, ever.",
  },
  {
    icon: "/images/icons/%23L01f50d.png",
    title: "Full Inspection Reports",
    description:
      "Every used vehicle comes with a comprehensive 50-point inspection report — engine, brakes, body, electronics.",
  },
  {
    icon: "/images/icons/%23L01f4ac.png",
    title: "Direct WhatsApp",
    description:
      "No middlemen. Chat directly with the verified seller. Average response time is under 2 minutes.",
  },
  {
    icon: "/images/icons/%23U26a1.png",
    title: "Real-Time Pricing",
    description:
      "Parts pricing updates instantly based on your delivery choice. No hidden fees. What you see is what you pay.",
  },
];

export function WhyAutoSecure() {
  return (
    <section id="why-autosecure" className="bg-[#050505] px-6 py-24 lg:px-16">
      {/* Gold top line */}
      <div className="mx-auto mb-16 h-px max-w-7xl bg-gradient-to-r from-transparent via-[#C9943A]/25 to-transparent" />

      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-[#C9943A]/20 bg-[#C9943A]/10 px-4 py-1.5 text-xs font-semibold text-[#C9943A]">
            Why autoSecure
          </span>
          <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Built on Trust.
            <br />
            Powered by{" "}
            <span className="text-[#C9943A]">Transparency.</span>
          </h2>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS.map((point, index) => (
            <ScrollReveal
              key={point.title}
              className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-6 text-center transition-all duration-300 hover:border-[#C9943A]/20 hover:-translate-y-0.5"
              delay={index * 90}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#C9943A]/15 bg-[#C9943A]/8">
                <ImagePlaceholder
                  label=""
                  className="h-9 w-9"
                  src={point.icon}
                />
              </div>
              <p className="mt-4 text-base font-bold text-white">
                {point.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/40">
                {point.description}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
