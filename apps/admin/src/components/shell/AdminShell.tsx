"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { IconType } from "react-icons";
import {
  FiBell,
  FiClipboard,
  FiCpu,
  FiDatabase,
  FiFileText,
  FiGitCommit,
  FiGrid,
  FiList,
  FiLogOut,
  FiMenu,
  FiMessageSquare,
  FiPackage,
  FiSettings,
  FiShield,
  FiShoppingBag,
  FiTool,
  FiX,
} from "react-icons/fi";
import { adminApi } from "@/lib/admin-api";
import { useAdminAuthStore } from "@/stores/auth-store";

type NavigationItem = {
  href: string;
  label: string;
  icon: IconType;
};

const navigationGroups: { label: string; items: NavigationItem[] }[] = [
  {
    label: "Overview",
    items: [{ href: "/", label: "Dashboard", icon: FiGrid }],
  },
  {
    label: "Marketplace",
    items: [
      { href: "/listings", label: "Listings", icon: FiClipboard },
      { href: "/suppliers", label: "Suppliers", icon: FiShoppingBag },
      { href: "/messages", label: "Messages", icon: FiMessageSquare },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/catalog", label: "Catalog management", icon: FiDatabase },
      { href: "/attributes", label: "Attributes", icon: FiList },
      { href: "/trims", label: "Vehicle trims", icon: FiTool },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/orders", label: "Orders", icon: FiPackage },
      { href: "/order-stages", label: "Order stages", icon: FiGitCommit },
      { href: "/quotes", label: "Quotes", icon: FiFileText },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/notifications", label: "Notifications", icon: FiBell },
      { href: "/ai-population", label: "AI population", icon: FiCpu },
      { href: "/settings", label: "Settings", icon: FiSettings },
    ],
  },
];

const allNavigationItems = navigationGroups.flatMap((group) => group.items);

function isActivePath(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

function pageTitle(pathname: string) {
  if (pathname === "/settings/security" || pathname === "/security")
    return "Security";
  return (
    allNavigationItems.find((item) => isActivePath(pathname, item.href))
      ?.label ?? "Operations console"
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAdminAuthStore((state) => state.logout);
  const accessToken = useAdminAuthStore((state) => state.accessToken);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    let active = true;
    async function refreshUnreadCount() {
      try {
        const response = await adminApi.getNotificationUnreadCount(accessToken as string);
        if (active) setUnreadCount(response.data.unreadCount);
      } catch {
        if (active) setUnreadCount(null);
      }
    }
    void refreshUnreadCount();
    window.addEventListener("admin-notifications-changed", refreshUnreadCount);
    return () => {
      active = false;
      window.removeEventListener("admin-notifications-changed", refreshUnreadCount);
    };
  }, [accessToken, pathname]);

  useEffect(() => {
    if (!isMobileOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMobileOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  function signOut() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-[var(--admin-paper)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[var(--admin-navy)] text-white lg:flex">
        <ShellNavigation pathname={pathname} onNavigate={() => undefined} onSignOut={signOut} />
      </aside>

      {isMobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-950/55"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside
            aria-label="Admin navigation"
            className="relative flex h-full w-[min(20rem,86vw)] flex-col bg-[var(--admin-navy)] text-white shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="absolute right-4 top-5 rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-gold)]"
              aria-label="Close navigation"
            >
              <FiX className="h-5 w-5" aria-hidden="true" />
            </button>
            <ShellNavigation
              pathname={pathname}
              onNavigate={() => setIsMobileOpen(false)}
              onSignOut={signOut}
            />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-4 border-b border-[var(--admin-line)] bg-white/95 px-5 backdrop-blur sm:px-8">
          <div className="flex min-w-0 items-center">
            <button
              type="button"
              className="mr-3 rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-gold)] lg:hidden"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open navigation"
              aria-expanded={isMobileOpen}
            >
              <FiMenu className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--admin-muted)]">
                autoSecure Mobility
              </p>
              <p className="truncate font-display text-xl font-bold">{pageTitle(pathname)}</p>
            </div>
          </div>
          <Link
            href="/notifications"
            aria-label={unreadCount === null ? "Notifications" : `Notifications, ${unreadCount} unread`}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[var(--admin-line)] px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-gold)]"
          >
            <FiBell aria-hidden="true" />
            <span className="hidden sm:inline">Notifications</span>
            {unreadCount !== null ? <span className="text-[var(--admin-muted)]">{unreadCount} unread</span> : null}
          </Link>
        </header>
        <main className="mx-auto max-w-[1440px] p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

function ShellNavigation({
  pathname,
  onNavigate,
  onSignOut,
}: {
  pathname: string;
  onNavigate: () => void;
  onSignOut: () => void;
}) {
  return (
    <>
      <div className="border-b border-white/10 px-7 py-7">
        <p className="font-display text-xl font-bold tracking-tight">
          autoSecure<span className="text-[var(--admin-gold)]">.</span>
        </p>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
          Operations console
        </p>
      </div>
      <nav aria-label="Primary" className="admin-sidebar-scroll flex-1 overflow-y-auto px-4 py-5">
        {navigationGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = isActivePath(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-gold)] ${active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-5">
        <Link
          href="/settings/security"
          onClick={onNavigate}
          className={`mb-3 flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold ${pathname === "/settings/security" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
        >
          <FiShield className="h-4 w-4" aria-hidden="true" /> Security
        </Link>
        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-gold)]"
        >
          <FiLogOut className="h-4 w-4" aria-hidden="true" /> Sign out
        </button>
      </div>
    </>
  );
}
