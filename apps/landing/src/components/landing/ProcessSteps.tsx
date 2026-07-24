import { ScrollReveal } from "@/components/ui/ScrollReveal";

const STEPS = [
  {
    number: "01",
    title: "Browse",
    symbol: "🔍",
    description:
      "Search and filter across 700+ listings of cars and parts to find exactly what you need.",
  },
  {
    number: "02",
    title: "Review",
    symbol: "📋",
    description:
      "View full specs, watch video walkthroughs, check inspection reports, and compare pricing options.",
  },
  {
    number: "03",
    title: "WhatsApp",
    symbol: "💬",
    highlight: true,
    description:
      "One click opens a pre-filled WhatsApp message to the dealer - average response under 2 minutes.",
  },
  {
    number: "04",
    title: "Secured",
    symbol: "🎉",
    description:
      "Finalize your deal directly with the verified seller. Fully transparent. Fully secured.",
  },
];

export function ProcessSteps() {
  return (
    <section className="bg-[#111B2F] px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-[1180px] text-center">
        <ScrollReveal>
          <span className="inline-flex h-6 items-center rounded-full border border-[#C9943A]/45 bg-[#C9943A]/15 px-4 text-[10px] font-black uppercase text-[#E0AE5A]">
            Simple Process
          </span>
          <h2 className="mx-auto mt-6 max-w-[620px] text-[40px] font-black leading-[1.18] text-white sm:text-[44px]">
            From Browse to{" "}
            <span className="text-[#C9943A]">Deal Closed</span>
            <br />
            in 4 Easy Steps
          </h2>
        </ScrollReveal>

        <div className="relative mt-[66px] grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          <div
            className="absolute left-[10%] right-[10%] top-9 hidden h-px bg-[#C9943A]/80 lg:block"
            aria-hidden
          />

          {STEPS.map((step, index) => (
            <ScrollReveal
              key={step.number}
              className="relative flex flex-col items-center"
              delay={index * 110}
              variant="zoom-in"
            >
              <div
                className={`relative z-10 flex h-[74px] w-[74px] items-center justify-center rounded-full border bg-[#202638] text-[28px] shadow-[0_0_0_1px_rgba(201,148,58,0.08)] ${
                  step.highlight
                    ? "border-[#A3A337] bg-[#173438]"
                    : "border-[#C9943A]/45"
                }`}
              >
                <span aria-hidden>{step.symbol}</span>
              </div>

              <p className="mt-5 text-[10px] font-black text-[#C9943A]">
                {step.number}
              </p>
              <h3 className="mt-2 text-[15px] font-black leading-none text-white">
                {step.title}
              </h3>
              <p className="mt-3 max-w-[232px] text-[12px] font-medium leading-6 text-white/45">
                {step.description}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
