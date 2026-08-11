"use client";

import { useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { useSupplierProfile } from "@/hooks/useSupplierProfile";
import { useSupplierAuthStore } from "@/stores/auth-store";

export function PortalShell({ children }: { children: ReactNode }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { profile } = useSupplierProfile();
  const { accessToken, hasHydrated } = useSupplierAuthStore();

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-portal-surface p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-portal-blue-600" />
          <p className="text-sm font-semibold text-slate-500">
            Loading supplier portal…
          </p>
        </div>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-portal-surface p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-portal-blue-600" />
          <p className="text-sm font-semibold text-slate-500">
            Redirecting to login…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar
        supplierName={profile?.businessName || undefined}
        supplierTier={profile?.tier || undefined}
        onOpenMobileNav={() => setIsMobileNavOpen(true)}
      />
      <MobileNavDrawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />
      <div className="flex min-w-0 flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 bg-portal-surface px-4 py-6 sm:px-6 md:px-10 md:py-8">
          <div className="mx-auto w-full max-w-5xl min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}

