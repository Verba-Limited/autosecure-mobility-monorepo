import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/PortalShell";
import { SubmitListingClient } from "@/components/portal/SubmitListingClient";

export const metadata: Metadata = {
  title: "Submit Listing for Approval | autoSecure Supplier Portal",
  description:
    "Review and submit your listing for admin approval before it goes live on the autoSecure marketplace.",
};

export default async function SubmitListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <PortalShell>
      <SubmitListingClient id={id} />
    </PortalShell>
  );
}
