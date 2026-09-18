import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/PortalShell";
import { AssignedQuotesClient } from "@/components/portal/AssignedQuotesClient";

export const metadata: Metadata = {
  title: "Assigned Quotes | AutoSecure Supplier Portal",
  description: "Review and respond to vehicle parts and accessories requests assigned to your dealership.",
};

export default function AssignedQuotesPage() {
  return (
    <PortalShell>
      <AssignedQuotesClient />
    </PortalShell>
  );
}
