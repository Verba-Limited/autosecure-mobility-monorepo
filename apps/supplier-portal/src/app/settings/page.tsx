"use client";

import { useEffect, useState, useRef } from "react";
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
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setPhysicalAddress(getString(raw.physicalAddress) || getString(raw.address) || getString(raw.location) || "");
    setCompanyDescription(
      getString(raw.companyDescription) || getString(raw.description) || getString(raw.bio) || "",
    );
    setAvatarUrl(getString(raw.avatarUrl) || getString(raw.avatar) || getString(raw.logo) || null);
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
        phone: contactPhone.trim(),
        physicalAddress: physicalAddress.trim(),
        companyDescription: companyDescription.trim(),
      });
      setMessage("Profile saved successfully.");
    } catch (err) {
      console.error("Failed to save profile", err);
      setMessage("Unable to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    // Assuming the API expects the file in the "file" field
    formData.append("file", file);

    try {
      const response = await supplierPortalApi.uploadAvatar(formData) as { data?: { avatar?: string } } | undefined;
      setMessage("Logo uploaded successfully.");
      
      // Attempt to update the avatar visually if the response contains it
      if (response && response.data && response.data.avatar) {
        setAvatarUrl(response.data.avatar);
      } else {
        // Fallback: reload the page to get the fresh profile
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to upload logo", err);
      setMessage("Unable to upload logo. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
            {avatarUrl ? (
              <img src={avatarUrl} alt="Company Logo" className="h-16 w-16 shrink-0 rounded-full border border-slate-200 object-cover" />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-portal-blue-600 text-2xl font-black text-white">
                {companyName ? companyName.charAt(0).toUpperCase() : "S"}
              </span>
            )}
            <div>
              <p className="mb-2 text-sm font-semibold text-portal-ink">
                Company Logo
              </p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarUpload} 
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-portal-ink hover:bg-slate-50 disabled:opacity-50"
              >
                {isUploading ? "Uploading..." : "Upload New Logo"}
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
            {/* <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-portal-ink">
                WhatsApp Business Number (Leads redirection)
              </span>
              <input
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="h-12 rounded-lg border border-slate-300 px-4 text-sm font-medium text-portal-ink outline-none focus:border-portal-blue-600 focus:ring-2 focus:ring-portal-blue-600/15"
              />
            </label> */}
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
