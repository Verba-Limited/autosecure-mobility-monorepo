import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function PortalShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <div className="flex min-w-0 flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 bg-portal-surface px-4 py-8 md:px-10">
          <div className="mx-auto w-full max-w-5xl min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
