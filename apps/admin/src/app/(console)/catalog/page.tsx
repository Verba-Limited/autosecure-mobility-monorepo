import { CatalogRoute, type CatalogView } from "@/components/routes/catalog/CatalogRoute";

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams;
  const catalogView: CatalogView = view === "config" ? "config" : "taxonomy";
  return <CatalogRoute view={catalogView} />;
}
