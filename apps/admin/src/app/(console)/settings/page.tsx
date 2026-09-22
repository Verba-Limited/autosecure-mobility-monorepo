import Link from "next/link";
import { FiDatabase, FiKey } from "react-icons/fi";
import { AdminPageHeader } from "@/components/ui/AdminPrimitives";

const settings = [
  {
    href: "/settings/security",
    title: "Security",
    description: "Change the password used to access the admin console.",
    icon: FiKey,
  },
  {
    href: "/catalog?view=config",
    title: "Catalog configuration",
    description: "Manage values used across vehicle and parts records.",
    icon: FiDatabase,
  },
];

export default function SettingsPage() {
  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Manage console security and shared platform configuration."
      />
      <div className="grid max-w-4xl gap-4 sm:grid-cols-2">
        {settings.map(({ href, title, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-[var(--admin-line)] bg-white p-6 transition hover:border-slate-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-gold)]"
          >
            <Icon className="h-5 w-5 text-[var(--admin-gold)]" aria-hidden="true" />
            <h2 className="mt-5 font-display text-lg font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--admin-muted)]">
              {description}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
