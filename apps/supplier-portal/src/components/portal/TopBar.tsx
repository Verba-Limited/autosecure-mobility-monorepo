"use client";

import Link from "next/link";
import { ArrowLeft, Menu, ShieldCheck } from "lucide-react";
import { LogoutButton } from "./LogoutButton";

interface TopBarProps {
  supplierName?: string;
  supplierTier?: string;
  onOpenMobileNav?: () => void;
}

export function TopBar({
  supplierName,
  supplierTier = "Supplier",
  onOpenMobileNav,
}: TopBarProps) {
  const isLoaded = Boolean(supplierName);
  const displayName = supplierName ?? "";
  const initial = displayName.trim().charAt(0).toUpperCase() || "S";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 bg-portal-ink px-4 md:px-6">
      <div className="flex items-center gap-3">
        {onOpenMobileNav && (
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
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

      <div className="flex items-center gap-2.5 sm:gap-4">
        <Link
          href="http://localhost:3001"
          className="hidden items-center gap-1.5 text-sm font-medium text-white/60 hover:text-white sm:flex"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Site
        </Link>

        <div className="flex items-center gap-2 rounded-lg bg-white/10 px-2.5 py-1.5">
          {/* Avatar initial or shimmer */}
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#1D3EB8] via-[#0D9488] text-xs font-bold text-white">
            {isLoaded ? initial : (
              <span className="h-3 w-3 rounded-full bg-white/30 animate-pulse" />
            )}
          </span>

          <div className="hidden leading-tight sm:block">
            {isLoaded ? (
              <>
                <p className="text-xs font-bold text-white">{displayName}</p>
                <p className="text-[11px] text-white/40">{supplierTier}</p>
              </>
            ) : (
              /* Shimmer placeholders while profile loads */
              <div className="space-y-1">
                <div className="h-2.5 w-24 animate-pulse rounded bg-white/20" />
                <div className="h-2 w-16 animate-pulse rounded bg-white/10" />
              </div>
            )}
          </div>
        </div>

        {/* Sign-out button */}
        <LogoutButton />
      </div>
    </header>
  );
}

