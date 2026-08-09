import { PortalShell } from "@/components/portal/PortalShell";
import { PageHeader } from "@/components/portal/PageHeader";
import { ListAPartClient } from "@/components/forms/ListAPartClient";

export default function ListPartPage() {
  return (
    <PortalShell>
      <PageHeader
        title="List a Part"
        description="Fill in the details below to add auto parts, accessories, or spare components."
      />
      <ListAPartClient />
    </PortalShell>
  );
}
