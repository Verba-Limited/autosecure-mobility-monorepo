import type { IconType } from "react-icons";
import { FiLayers } from "react-icons/fi";
import { AdminPageHeader } from "@/components/ui/AdminPrimitives";

export function AdminRoutePlaceholder({
  title,
  description,
  nextStep,
  icon: Icon = FiLayers,
}: {
  title: string;
  description: string;
  nextStep: number;
  icon?: IconType;
}) {
  return (
    <>
      <AdminPageHeader title={title} description={description} />
      <section className="flex min-h-56 max-w-3xl items-start gap-4 rounded-2xl border border-[var(--admin-line)] bg-white p-6 sm:p-8">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--admin-navy)] text-[var(--admin-gold)]">
          <Icon aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold">Route ready for integration</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--admin-muted)]">
            Navigation and authenticated access are ready. API data and actions will be added in Step {nextStep} without using placeholder records.
          </p>
        </div>
      </section>
    </>
  );
}
