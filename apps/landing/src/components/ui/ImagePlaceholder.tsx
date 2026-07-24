import Image from "next/image";
import { ImageIcon } from "lucide-react";

type ImagePlaceholderProps = {
  label: string;
  className?: string;
  src?: string;
  tone?: "light" | "dark";
};

/**
 * Stand-in for real photography/video assets.
 * Swap the parent's background for an <Image> or <video> once
 * the exported Figma assets are available — the label makes it
 * obvious which asset belongs where.
 */
export function ImagePlaceholder({
  label,
  className = "",
  src,
  tone = "light",
}: ImagePlaceholderProps) {
  const toneClasses =
    tone === "dark"
      ? "bg-navy-800 text-navy-600/70"
      : "bg-navy-900/5 text-navy-900/30";

  if (src) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={label}
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 ${toneClasses} ${className}`}
    >
      <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
      <span className="px-3 text-center text-[11px] font-medium uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}
