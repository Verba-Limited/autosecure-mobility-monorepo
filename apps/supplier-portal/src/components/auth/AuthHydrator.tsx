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
  const { accessToken, hasHydrated } = useSupplierAuthStore();

  useEffect(() => {
    hydrateSupplierAuthStore();
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    const isAuthRoute = AUTH_ROUTES.has(pathname);

    console.log("[AUTH DEBUG] AuthHydrator evaluated", {
      pathname,
      hasAccessToken: Boolean(accessToken),
      hasHydrated,
      isAuthRoute,
    });

    if (accessToken && isAuthRoute) {
      const next = searchParams.get("next");
      const target = next?.startsWith("/") ? next : "/";
      console.log(
        `[AUTH DEBUG] User has token on auth route (${pathname}), replacing route with: ${target}`,
      );
      router.replace(target);
    } else if (!accessToken && !isAuthRoute) {
      const nextParam = pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";
      const target = `/login${nextParam}`;
      console.log(
        `[AUTH DEBUG] User has no token on protected route (${pathname}), replacing route with: ${target}`,
      );
      router.replace(target);
    }
  }, [accessToken, hasHydrated, pathname, router, searchParams]);

  return null;
}