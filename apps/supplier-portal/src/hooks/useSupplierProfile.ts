/**
 * useSupplierProfile.ts
 *
 * Fetches the logged-in supplier's profile once on mount and
 * returns the business name, tier, and loading state.
 * Used by TopBar, DashboardClient, and any other component that
 * needs to display the supplier's real identity.
 */
"use client";

import { useEffect, useState } from "react";
import { supplierPortalApi } from "@/lib/supplier-api";

export type SupplierProfile = {
  businessName: string;
  tier: string;
};

function extractProfile(raw: unknown): SupplierProfile {
  if (!raw || typeof raw !== "object") {
    return { businessName: "", tier: "Supplier" };
  }

  const r = raw as Record<string, unknown>;

  // The API can return the profile nested under `data`
  const obj = (r.data && typeof r.data === "object"
    ? (r.data as Record<string, unknown>)
    : r) as Record<string, unknown>;

  const businessName =
    (obj.businessName as string) ??
    (obj.companyName as string) ??
    (obj.name as string) ??
    "";

  const tier =
    (obj.plan as string) ??
    (obj.tier as string) ??
    (obj.subscriptionPlan as string) ??
    "Supplier";

  return { businessName, tier };
}

export function useSupplierProfile() {
  const [profile, setProfile] = useState<SupplierProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const raw = await supplierPortalApi.getProfile();
        if (!cancelled) {
          setProfile(extractProfile(raw));
        }
      } catch {
        // Profile fetch failed — leave as null, components will show fallback
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { profile, isLoading };
}
