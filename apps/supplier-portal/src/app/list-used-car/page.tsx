import { PortalShell } from "@/components/portal/PortalShell";
import { PageHeader } from "@/components/portal/PageHeader";
import { ListUsedCarClient } from "@/components/forms/ListUsedCarClient";

export default function ListUsedCarPage() {
  return (
    <PortalShell>
      <PageHeader
        title="List Used Car"
        description="Fill in the details below to add a registered or pre-owned vehicle to your inventory."
      />
      <ListUsedCarClient />
    </PortalShell>
  );
}
