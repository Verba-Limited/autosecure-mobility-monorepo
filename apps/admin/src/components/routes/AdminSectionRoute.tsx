"use client";

import { AdminClient, type AdminSection } from "@/components/AdminClient";
import { useAdminAuthStore } from "@/stores/auth-store";

export function AdminSectionRoute({
  section,
  initialStatus = "",
  initialQuery = "",
}: {
  section: AdminSection;
  initialStatus?: string;
  initialQuery?: string;
}) {
  const accessToken = useAdminAuthStore((state) => state.accessToken);
  return accessToken ? (
    <AdminClient
      accessToken={accessToken}
      section={section}
      initialStatus={initialStatus}
      initialQuery={initialQuery}
    />
  ) : null;
}
