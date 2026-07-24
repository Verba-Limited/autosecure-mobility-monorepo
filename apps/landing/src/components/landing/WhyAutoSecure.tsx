import { MessageCircle, Search, ShieldCheck, Zap } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ImagePlaceholder } from "../ui/ImagePlaceholder";

type Point = {
  icon: string;
  title: string;
  // image: string;
  description: string;
};

const POINTS: Point[] = [
  {
    icon: "/images/icons/🛡️.png",
    title: "Verified Suppliers",
    description:
      "Every dealer and supplier undergoes a rigorous verification process before listing. No fake listings, ever.",
  },
  {
    icon: "/images/icons/🔍.png",
    title: "Full Inspection Reports",
    description:
      "Every used vehicle comes with a comprehensive 50-point inspection report — engine, brakes, body, electronics.",
  },
  {
    icon: "/images/icons/💬.png",
    title: "Direct WhatsApp",
    description:
      "No middlemen. Chat directly with the verified seller. Average response time is under 2 minutes.",
  },
  {
    icon: "/images/icons/⚡.png",
    title: "Real-Time Pricing",
    description:
      "Parts pricing updates instantly based on your delivery choice. No hidden fees. What you see is what you pay.",
  },
];

export function WhyAutoSecure() {
  return (
    <section className="bg-white px-6 py-24 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-cream-100 px-4 py-1.5 text-xs font-semibold text-gold-600">
            Why autoSecure
          </span>
          <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-navy-900 sm:text-5xl">
            Built on Trust.
            <br />
            Powered by <span className="text-gold-500">Transparency.</span>
          </h2>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS.map((point, index) => (
            <ScrollReveal
              key={point.title}
              className="rounded-2xl border border-navy-900/10 p-6 text-center"
              delay={index * 90}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy-900/5">
                {/* <point.icon
                  className="h-5 w-5 text-navy-900"
                  strokeWidth={1.75}
                /> */}

                <ImagePlaceholder
                  label=""
                  className="h-9 w-9"
                  src={point.icon}
                />
              </div>
              <p className="mt-4 text-base font-bold text-navy-900">
                {point.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-navy-900/55">
                {point.description}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
