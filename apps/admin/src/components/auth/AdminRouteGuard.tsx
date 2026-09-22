"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminLoadingState } from "@/components/ui/AdminPrimitives";
import { useAdminAuthStore } from "@/stores/auth-store";

export function AdminRouteGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken, hasHydrated, hydrate } = useAdminAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hasHydrated || accessToken) return;
    const loginUrl = new URL("/login", window.location.origin);
    loginUrl.searchParams.set("returnTo", pathname);
    router.replace(`${loginUrl.pathname}${loginUrl.search}`);
  }, [accessToken, hasHydrated, pathname, router]);

  if (!hasHydrated || !accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--admin-paper)]">
        <AdminLoadingState label="Checking admin session" />
      </div>
    );
  }

  return children;
}
