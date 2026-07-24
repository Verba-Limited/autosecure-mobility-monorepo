import { ArrowUp } from "lucide-react";

export function StatCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="rounded-2xl border border-portal-border bg-white p-5">
      <p className="text-xs font-bold tracking-[1px] text-[#9BA8C0]">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-portal-ink">{value}</p>
      <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-brand-green-600">
        <ArrowUp className="h-3.5 w-3.5" />
        {delta}
      </p>
    </div>
  );
}

export function PlanCard({
  planName,
  renewsOn,
}: {
  planName: string;
  renewsOn: string;
}) {
  return (
    <div className="rounded-2xl bg-portal-blue-600 p-5 text-white">
      <p className="text-xs font-semibold tracking-wide text-white/70">PLAN</p>
      <p className="mt-2 text-2xl font-extrabold">{planName}</p>
      <p className="mt-1.5 text-xs text-white/80">Renews {renewsOn}</p>
    </div>
  );
}
