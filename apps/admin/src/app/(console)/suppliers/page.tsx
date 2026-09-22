import { SuppliersRoute } from "@/components/routes/SuppliersRoute";

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;
  return <SuppliersRoute initialQuery={query} />;
}
