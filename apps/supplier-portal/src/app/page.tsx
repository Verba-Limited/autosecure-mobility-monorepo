import { DashboardClient } from "@/components/portal/DashboardClient";
import { PortalShell } from "@/components/portal/PortalShell";

export default function DashboardPage() {
  return (
    <PortalShell>
      <DashboardClient />
    </PortalShell>
  );
}
