import { PortalShell } from "@/components/portal/PortalShell";
import { OrdersClient } from "@/components/portal/OrdersClient";

export const metadata = {
  title: "Order Tracking — AutoSecure Supplier Portal",
  description: "Track customer vehicle orders and shipment milestones for your listings.",
};

export default function OrdersPage() {
  return (
    <PortalShell>
      <OrdersClient />
    </PortalShell>
  );
}
