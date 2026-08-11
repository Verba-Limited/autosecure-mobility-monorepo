"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, X } from "lucide-react";
import type { NavItem } from "@/lib/nav-items";
import { mainNavItems, manageNavItems } from "@/lib/nav-items";
import { supplierPortalApi } from "@/lib/supplier-api";
import { getApiItems, getApiTotalItems } from "@/lib/supplier-listing-mappers";
import { LogoutButton } from "./LogoutButton";

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

function DrawerNavLink({ item, onClick }: { item: NavItem; onClick: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center justify-between rounded-lg px-3.5 py-3 text-sm font-semibold transition-colors ${
        isActive
          ? "bg-portal-blue-600 text-white"
          : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      <span className="flex items-center gap-3">
        <Image
          src={item.iconSrc}
          alt=""
          aria-hidden="true"
          width={20}
          height={20}
          className="h-5 w-5 shrink-0"
        />
        {item.label}
      </span>
      {typeof item.badge === "number" && (
        <span
          className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
            isActive
              ? "bg-white/20 text-white"
              : item.badgeClassName ?? "bg-slate-200 text-slate-700"
          }`}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function MobileNavDrawer({ isOpen, onClose }: MobileNavDrawerProps) {
  const [listingCount, setListingCount] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    async function loadListingCount() {
      try {
        const payload = await supplierPortalApi.getListings(1, 1);
        const total = getApiTotalItems(payload) ?? getApiItems(payload).length;
        if (isMounted) setListingCount(total);
      } catch {
        if (isMounted) setListingCount(null);
      }
    }

    loadListingCount();
    return () => { isMounted = false; };
  }, [isOpen]);

  const manageItems = useMemo(
    () =>
      manageNavItems.map((item) =>
        item.href === "/my-listings" && listingCount !== null
          ? { ...item, badge: listingCount }
          : item,
      ),
    [listingCount],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col justify-between bg-white px-5 py-6 shadow-2xl transition-transform">
        <div>
          {/* Header */}
          <div className="mb-6 flex items-center justify-between border-b border-portal-border pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-portal-blue-600 text-white">
                <ShieldCheck className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <div className="leading-tight">
                <span className="text-sm font-bold text-portal-ink">
                  auto<span className="text-gold-500">Secure</span>
                </span>
                <p className="text-[10px] font-bold tracking-wide text-slate-400">
                  SUPPLIER PORTAL
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav groups */}
          <div className="flex flex-col gap-6 overflow-y-auto">
            <div>
              <p className="mb-2 px-3 text-xs font-bold tracking-wider text-slate-400">
                MAIN
              </p>
              <div className="flex flex-col gap-1">
                {mainNavItems.map((item) => (
                  <DrawerNavLink key={item.href} item={item} onClick={onClose} />
                ))}
              </div>
            </div>

            <div className="border-t border-portal-border pt-4">
              <p className="mb-2 px-3 text-xs font-bold tracking-wider text-slate-400">
                MANAGE
              </p>
              <div className="flex flex-col gap-1">
                {manageItems.map((item) => (
                  <DrawerNavLink key={item.href} item={item} onClick={onClose} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-portal-border pt-4">
          <LogoutButton variant="nav" />
        </div>
      </div>
    </div>
  );
}
