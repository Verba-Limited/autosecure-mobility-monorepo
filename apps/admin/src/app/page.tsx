"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { AdminClient } from "@/components/AdminClient";
import { useAdminAuthStore } from "@/stores/auth-store";

export default function AdminPage() {
  const router = useRouter();
  const { accessToken, hasHydrated, hydrate } = useAdminAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);
  useEffect(() => {
    if (hasHydrated && !accessToken) router.replace("/login");
  }, [accessToken, hasHydrated, router]);

  if (!hasHydrated || !accessToken)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--admin-paper)]">
        <Loader2
          className="h-7 w-7 animate-spin text-[var(--admin-gold)]"
          aria-label="Loading admin console"
        />
      </div>
    );
  return <AdminClient accessToken={accessToken} />;
}
