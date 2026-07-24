export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-portal-border bg-white px-6 py-20 text-center">
      <h1 className="text-xl font-bold text-portal-ink">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        This page hasn&apos;t been designed yet — send over the Figma design for{" "}
        {title.toLowerCase()} and it&apos;ll be built out here.
      </p>
    </div>
  );
}
