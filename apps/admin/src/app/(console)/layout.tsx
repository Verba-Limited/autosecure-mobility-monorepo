import type { ReactNode } from "react";
import { AdminRouteGuard } from "@/components/auth/AdminRouteGuard";
import { AdminShell } from "@/components/shell/AdminShell";

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <AdminRouteGuard>
      <AdminShell>{children}</AdminShell>
    </AdminRouteGuard>
  );
}
