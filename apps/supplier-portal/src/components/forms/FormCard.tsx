export function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-8 rounded-2xl border border-portal-border bg-white p-6 sm:p-8">
      {children}
    </div>
  );
}
