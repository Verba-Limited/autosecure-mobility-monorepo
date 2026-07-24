const ITEMS = [
  {
    label: "Brand New Cars",
    textClassName: "text-white/80",
    markerClassName: "text-white",
  },
  {
    label: "Certified Used Vehicles",
    textClassName: "text-[#00D6A3]",
    markerClassName: "text-[#00D6A3]",
  },
  {
    label: "Aftermarket Parts",
    textClassName: "text-white/80",
    markerClassName: "text-white",
  },
  {
    label: "Instant WhatsApp Connect",
    textClassName: "text-[#2563EB]",
    markerClassName: "text-[#2563EB]",
  },
  {
    label: "Verified Suppliers",
    textClassName: "text-white/80",
    markerClassName: "text-white",
  },
  {
    label: "Next-Day Delivery Available",
    textClassName: "text-[#00D6A3]",
    markerClassName: "text-[#00D6A3]",
  },
];

export function Marquee() {
  const items = [...ITEMS, ...ITEMS];

  return (
    <div className="overflow-hidden border-y border-white/5 bg-navy-950 py-3">
      <div className="flex w-max animate-marquee gap-10 motion-reduce:animate-none">
        {items.map((item, i) => (
          <span
            key={`${item.label}-${i}`}
            className={`flex items-center gap-10 text-xs font-semibold uppercase tracking-wide ${item.textClassName}`}
          >
            <span className={item.markerClassName}>+</span>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
