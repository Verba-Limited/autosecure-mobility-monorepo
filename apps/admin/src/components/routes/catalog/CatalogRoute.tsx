import Link from "next/link";
import { AdminPageHeader } from "@/components/ui/AdminPrimitives";
import { ConfigPanel } from "@/components/routes/catalog/ConfigPanel";
import { TaxonomyPanel } from "@/components/routes/catalog/TaxonomyPanel";

export type CatalogView = "taxonomy" | "config";

export function CatalogRoute({ view }: { view: CatalogView }) {
  return (
    <>
      <AdminPageHeader
        title="Catalog management"
        description="Maintain structured vehicle classifications separately from miscellaneous platform options."
      />
      <nav aria-label="Catalog management sections" className="mb-6 flex gap-2 border-b border-[var(--admin-line)]">
        <CatalogTab href="/catalog?view=taxonomy" active={view === "taxonomy"}>Taxonomy</CatalogTab>
        <CatalogTab href="/catalog?view=config" active={view === "config"}>Platform configuration</CatalogTab>
      </nav>
      {view === "taxonomy" ? <TaxonomyPanel /> : <ConfigPanel />}
    </>
  );
}

function CatalogTab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`border-b-2 px-3 py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-gold)] ${active ? "border-[var(--admin-gold)] text-[var(--admin-ink)]" : "border-transparent text-[var(--admin-muted)] hover:text-[var(--admin-ink)]"}`}
    >
      {children}
    </Link>
  );
}
