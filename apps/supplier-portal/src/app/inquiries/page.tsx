import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/PortalShell";
import { InquiriesClient } from "@/components/portal/InquiriesClient";

export const metadata: Metadata = {
  title: "Inquiries & Leads | AutoSecure Supplier Portal",
  description: "View and manage prospective buyer leads and inquiries.",
};

export default function InquiriesPage() {
  return (
    <PortalShell>
      <InquiriesClient />
    </PortalShell>
  );
}

