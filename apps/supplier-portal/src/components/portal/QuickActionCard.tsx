import Link from "next/link";
import Image from "next/image";

export function QuickActionCard({
  label,
  href,
  iconSrc,
}: {
  label: string;
  href: string;
  iconSrc: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center h-[50px] w-46.75 gap-3 rounded-xl border border-portal-border bg-white px-4 py-4 text-sm font-semibold text-portal-ink transition-colors hover:border-portal-blue-600/40 hover:bg-slate-50"
    >
      <Image
        src={iconSrc}
        alt=""
        aria-hidden="true"
        width={24}
        height={24}
        className="h-5 w-5 shrink-0"
      />
      {label}
    </Link>
  );
}
