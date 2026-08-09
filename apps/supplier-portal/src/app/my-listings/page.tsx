import { MyListingsClient } from "@/components/portal/MyListingsClient";
import { PortalShell } from "@/components/portal/PortalShell";

export default function MyListingsPage() {
  return (
    <PortalShell>
      <MyListingsClient />
    </PortalShell>
  );
}
