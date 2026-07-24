import { PortalShell } from "@/components/portal/PortalShell";

export default function SettingsPage() {
  return (
    <PortalShell>
      <div className="mb-7">
        <h1 className="text-3xl font-black tracking-tight text-portal-ink">
          Settings
        </h1>
        <p className="mt-1.5 text-sm font-normal text-[#64748B]">
          Configure your company profile, account security, and subscription
          billing.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-portal-border bg-white shadow-sm">
        <div className="flex border-b border-portal-border bg-white px-6">
          {["Company Profile", "Account & Security", "Subscription & Plan"].map(
            (tab, index) => (
              <button
                key={tab}
                className={`border-b-2 px-4 py-5 text-sm font-semibold ${index === 0 ? "border-portal-blue-600 text-portal-blue-600" : "border-transparent text-[#64748B]"}`}
              >
                {tab}
              </button>
            ),
          )}
        </div>

        <form className="p-8">
          <div className="mb-5 flex items-center gap-5">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-portal-blue-600 text-2xl font-black text-white">
              S
            </span>
            <div>
              <p className="mb-2 text-sm font-semibold text-portal-ink">
                Company Logo
              </p>
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-portal-ink hover:bg-slate-50"
              >
                Upload New Logo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-portal-ink">
                Supplier Name
              </span>
              <input
                defaultValue="AutoSecure Ltd"
                className="h-12 rounded-lg border border-slate-300 px-4 text-sm font-medium text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-portal-ink">
                Business Email
              </span>
              <input
                defaultValue="info@autosecure.com"
                className="h-12 rounded-lg border border-slate-300 px-4 text-sm font-medium text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-portal-ink">
                Contact Phone Number
              </span>
              <input
                defaultValue="+234 803 123 4567"
                className="h-12 rounded-lg border border-slate-300 px-4 text-sm font-medium text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-portal-ink">
                WhatsApp Business Number (Leads redirection)
              </span>
              <input
                defaultValue="+234 803 123 4567"
                className="h-12 rounded-lg border border-slate-300 px-4 text-sm font-medium text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15"
              />
            </label>
          </div>

          <label className="mt-6 flex flex-col gap-2">
            <span className="text-sm font-semibold text-portal-ink">
              Physical Address
            </span>
            <input
              defaultValue="15 Admiralty Way, Lekki Phase 1, Lagos"
              className="h-12 rounded-lg border border-slate-300 px-4 text-sm font-medium text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15"
            />
          </label>

          <label className="mt-6 flex flex-col gap-2">
            <span className="text-sm font-semibold text-portal-ink">
              Company Description / Bio
            </span>
            <textarea
              defaultValue="Premium supplier of luxury cars, Tokunbo imports, and high-quality genuine spare parts. Operating in Lekki, Lagos."
              rows={4}
              className="resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15"
            />
          </label>

          <button
            type="button"
            className="mt-5 rounded-lg bg-portal-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-portal-blue-700"
          >
            Save Changes
          </button>
        </form>
      </div>
    </PortalShell>
  );
}
