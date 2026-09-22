import { ListingsRoute } from "@/components/routes/listings/ListingsRoute";

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; query?: string }>;
}) {
  const { status, query } = await searchParams;
  return <ListingsRoute initialStatus={status} initialQuery={query} />;
}
