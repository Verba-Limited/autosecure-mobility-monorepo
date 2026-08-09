"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useSupplierProfile } from "@/hooks/useSupplierProfile";

export function PortalShell({ children }: { children: ReactNode }) {
  const { profile } = useSupplierProfile();

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar
        supplierName={profile?.businessName || undefined}
        supplierTier={profile?.tier || undefined}
      />
      <div className="flex min-w-0 flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 bg-portal-surface px-4 py-8 md:px-10">
          <div className="mx-auto w-full max-w-5xl min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
