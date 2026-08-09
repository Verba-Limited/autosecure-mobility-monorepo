"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  hydrateSupplierAuthStore,
  useSupplierAuthStore,
} from "@/stores/auth-store";

const AUTH_ROUTES = new Set([
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
]);

export function AuthHydrator() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log("[AUTH DEBUG] AuthHydrator useEffect running for pathname:", pathname);
    hydrateSupplierAuthStore();

    const { accessToken } = useSupplierAuthStore.getState();

    console.log("[AUTH DEBUG] AuthHydrator status", {
      pathname,
      hasAccessToken: Boolean(accessToken),
      isAuthRoute: AUTH_ROUTES.has(pathname),
    });

    if (accessToken && AUTH_ROUTES.has(pathname)) {
      const next = searchParams.get("next");
      const target = next?.startsWith("/") ? next : "/";
      console.log(`[AUTH DEBUG] AuthHydrator: User has token on auth route (${pathname}), replacing route with: ${target}`);
      router.replace(target);
    }
  }, [pathname, router, searchParams]);

  return null;
}