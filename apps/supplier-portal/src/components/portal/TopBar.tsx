import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

interface TopBarProps {
  supplierName?: string;
  supplierTier?: string;
}

export function TopBar({
  supplierName = "AutoSecure Ltd",
  supplierTier = "Premium Supplier",
}: TopBarProps) {
  const initial = supplierName.trim().charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 bg-portal-ink px-4 md:px-6">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
          <ShieldCheck
            className="h-4.5 w-4.5 text-portal-blue-600"
            strokeWidth={2.5}
          />
        </span>
        <div className="leading-tight">
          <span className="text-sm font-bold text-white">
            auto<span className="text-gold-400">Secure</span>
          </span>
          <p className="text-[10px] font-semibold tracking-wide text-slate-400">
            MOBILITY
          </p>
        </div>
        <span className="ml-2 hidden rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white/40 sm:inline-block">
          SUPPLIER PORTAL
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="hidden items-center gap-1.5 text-sm text-white/60 hover:text-white sm:flex font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Site
        </Link>
        <div className="flex items-center gap-2 rounded-lg bg-white/10 px-2.5 py-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-r from-[#1D3EB8] via-[#0D9488]  text-xs font-bold text-white">
            {initial}
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="text-xs font-bold text-white">{supplierName}</p>
            <p className="text-[11px] text-white/40 text-normal">
              {supplierTier}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
