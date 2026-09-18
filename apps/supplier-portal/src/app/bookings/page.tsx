import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/PortalShell";
import { BookingsClient } from "@/components/portal/BookingsClient";

export const metadata: Metadata = {
  title: "Bookings & Inspections | AutoSecure Supplier Portal",
  description: "Manage customer test-drives and vehicle inspection appointments.",
};

export default function BookingsPage() {
  return (
    <PortalShell>
      <BookingsClient />
    </PortalShell>
  );
}
