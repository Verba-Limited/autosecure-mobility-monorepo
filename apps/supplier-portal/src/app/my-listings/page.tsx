import { MyListingsClient } from "@/components/portal/MyListingsClient";
import { PortalShell } from "@/components/portal/PortalShell";

import { Suspense } from "react";

export default function MyListingsPage() {
  return (
    <PortalShell>
      <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading listings...</div>}>
        <MyListingsClient />
      </Suspense>
    </PortalShell>
  );
}
