export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 border-b border-portal-border pb-3 text-lg font-bold text-portal-ink">
      {children}
    </h2>
  );
}
