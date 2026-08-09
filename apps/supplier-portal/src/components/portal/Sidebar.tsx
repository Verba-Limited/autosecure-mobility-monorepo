"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { NavItem } from "@/lib/nav-items";
import { mainNavItems, manageNavItems } from "@/lib/nav-items";
import { supplierPortalApi } from "@/lib/supplier-api";
import { getApiItems, getApiTotalItems } from "@/lib/supplier-listing-mappers";
import { LogoutButton } from "./LogoutButton";

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href}
      className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
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
          className="h-4.5 w-4.5 shrink-0"
        />
        {item.label}
      </span>
      {typeof item.badge === "number" && (
        <span
          className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
            item.badgeClassName ?? "bg-slate-200 text-slate-700"
          }`}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const [listingCount, setListingCount] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadListingCount() {
      try {
        const payload = await supplierPortalApi.getListings(1, 1);
        const total = getApiTotalItems(payload) ?? getApiItems(payload).length;

        if (isMounted) {
          setListingCount(total);
        }
      } catch {
        if (isMounted) {
          setListingCount(null);
        }
      }
    }

    loadListingCount();

    return () => {
      isMounted = false;
    };
  }, []);

  const manageItems = useMemo(
    () =>
      manageNavItems.map((item) =>
        item.href === "/my-listings" && listingCount !== null
          ? { ...item, badge: listingCount }
          : item,
      ),
    [listingCount],
  );

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 overflow-y-auto border-r border-portal-border bg-white px-4 py-6 md:flex md:flex-col">
      <nav className="flex flex-1 flex-col justify-between">
        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-2 px-3 text-xs font-semibold tracking-wide text-slate-400">
              MAIN
            </p>
            <div className="flex flex-col gap-1">
              {mainNavItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          </div>

          <div className="border-t border-portal-border pt-5">
            <p className="mb-2 px-3 text-xs font-semibold tracking-wide text-slate-400">
              MANAGE
            </p>
            <div className="flex flex-col gap-1">
              {manageItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-portal-border pt-4">
          <LogoutButton variant="nav" />
        </div>
      </nav>
    </aside>
  );
}