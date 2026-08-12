"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { PortalShell } from "@/components/portal/PortalShell";
import { useSupplierProfile } from "@/hooks/useSupplierProfile";
import { supplierPortalApi } from "@/lib/supplier-api";

function getString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export default function SettingsPage() {
  const { profile, isLoading } = useSupplierProfile();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;

    const raw = profile.raw ?? {};
    const fullName =
      getString(raw.name) ||
      `${getString(raw.firstName)} ${getString(raw.lastName)}`.trim();
    const [first = "", ...rest] = fullName.split(" ").filter(Boolean);
    const last = rest.join(" ");

    setFirstName(getString(raw.firstName) || first);
    setLastName(getString(raw.lastName) || last);
    setCompanyName(getString(raw.companyName) || profile.businessName || "");
    setBusinessEmail(
      getString(raw.email) || getString(raw.businessEmail) || "",
    );
    setContactPhone(getString(raw.phone) || getString(raw.contactPhone) || "");
    setWhatsappNumber(
      getString(raw.whatsapp) || getString(raw.whatsappNumber) || "",
    );
    setPhysicalAddress(getString(raw.address) || getString(raw.location) || "");
    setCompanyDescription(
      getString(raw.description) || getString(raw.bio) || "",
    );
  }, [profile]);

  async function handleSave() {
    setMessage(null);

    if (!firstName || !lastName || !companyName) {
      setMessage("Please provide first name, last name, and company name.");
      return;
    }

    setIsSaving(true);
    try {
      await supplierPortalApi.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        companyName: companyName.trim(),
      });
      setMessage("Profile saved successfully.");
    } catch (err) {
      console.error("Failed to save profile", err);
      setMessage("Unable to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

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
                type="button"
                className={`border-b-2 px-4 py-5 text-sm font-semibold ${
                  index === 0
                    ? "border-portal-blue-600 text-portal-blue-600"
                    : "border-transparent text-[#64748B]"
                }`}
              >
                {tab}
              </button>
            ),
          )}
        </div>

        <form className="p-8">
          {isLoading && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-6 py-5 text-sm text-slate-600">
              <Loader2 className="inline h-4 w-4 animate-spin" /> Loading
              profile...
            </div>
          )}

          {message && (
            <div className="mb-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {message}
            </div>
          )}

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
                First Name
              </span>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-12 rounded-lg border border-slate-300 px-4 text-sm font-medium text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-portal-ink">
                Last Name
              </span>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-12 rounded-lg border border-slate-300 px-4 text-sm font-medium text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15"
              />
            </label>
            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-sm font-semibold text-portal-ink">
                Company Name
              </span>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="h-12 rounded-lg border border-slate-300 px-4 text-sm font-medium text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-portal-ink">
                Business Email
              </span>
              <input
                value={businessEmail}
                disabled
                className="h-12 rounded-lg border border-slate-300 bg-slate-50 px-4 text-sm font-medium text-slate-500 outline-none"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-portal-ink">
                Contact Phone Number
              </span>
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="h-12 rounded-lg border border-slate-300 px-4 text-sm font-medium text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-portal-ink">
                WhatsApp Business Number (Leads redirection)
              </span>
              <input
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="h-12 rounded-lg border border-slate-300 px-4 text-sm font-medium text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15"
              />
            </label>
          </div>

          <label className="mt-6 flex flex-col gap-2">
            <span className="text-sm font-semibold text-portal-ink">
              Physical Address
            </span>
            <input
              value={physicalAddress}
              onChange={(e) => setPhysicalAddress(e.target.value)}
              className="h-12 rounded-lg border border-slate-300 px-4 text-sm font-medium text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15"
            />
          </label>

          <label className="mt-6 flex flex-col gap-2">
            <span className="text-sm font-semibold text-portal-ink">
              Company Description / Bio
            </span>
            <textarea
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              rows={4}
              className="resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15"
            />
          </label>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-portal-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-portal-blue-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </PortalShell>
  );
}
