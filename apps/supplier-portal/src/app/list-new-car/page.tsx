import { PortalShell } from "@/components/portal/PortalShell";
import { PageHeader } from "@/components/portal/PageHeader";
import { ListNewCarClient } from "@/components/forms/ListNewCarClient";

export default function ListNewCarPage() {
  return (
    <PortalShell>
      <PageHeader
        title="List New Car"
        description="Fill in the details below to add a brand new vehicle to your inventory."
      />
      <ListNewCarClient />
    </PortalShell>
  );
}
