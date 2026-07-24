export function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-portal-ink">
        {title}
      </h1>
      <p className="mt-1.5 text-sm text-slate-500">{description}</p>
    </div>
  );
}
