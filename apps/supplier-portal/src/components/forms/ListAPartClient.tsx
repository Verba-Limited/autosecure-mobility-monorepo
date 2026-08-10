"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormCard } from "@/components/forms/FormCard";
import { SectionHeading } from "@/components/forms/SectionHeading";
import {
  TextField,
  SelectField,
  TextAreaField,
} from "@/components/forms/Field";
import { SegmentedToggle } from "@/components/forms/SegmentedToggle";
import { MediaUpload } from "@/components/forms/MediaUpload";
import { FormActions } from "@/components/forms/FormActions";
import { supplierPortalApi } from "@/lib/supplier-api";
import type { CreatePartListingPayload, DeliveryOption } from "@autosecure/api";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const PART_CATEGORIES = [
  "Engine Parts",
  "Brake Systems",
  "Suspension",
  "Electrical Components",
  "Body Parts",
  "Filters",
  "Batteries",
  "Tyres",
  "Lubricants",
  "Accessories",
];

const DELIVERY_OPTIONS: { label: string; value: DeliveryOption }[] = [
  { label: "Standard Shipping", value: "STANDARD" },
  { label: "Next-Day Delivery", value: "NEXT_DAY" },
  { label: "Economy Shipping", value: "ECONOMY" },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function ListAPartClient() {
  const router = useRouter();

  // Form State
  const [partTitle, setPartTitle] = useState("");
  const [partName, setPartName] = useState("");
  const [partCategory, setPartCategory] = useState("Brake Systems");
  const [brand, setBrand] = useState("");
  const [oemNumber, setOemNumber] = useState("");
  const [warranty, setWarranty] = useState("");
  const [inStock, setInStock] = useState(true);
  const [compatibilityInput, setCompatibilityInput] = useState("");

  // Pricing State
  const [retailPrice, setRetailPrice] = useState("");
  const [promotionalPrice, setPromotionalPrice] = useState("");
  const [fleetPrice, setFleetPrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [emi, setEmi] = useState("");

  // Delivery & Description State
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOption[]>([
    "STANDARD",
    "NEXT_DAY",
  ]);
  const [description, setDescription] = useState("");

  // Media State
  const [files, setFiles] = useState<File[]>([]);

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleDeliveryToggle(option: DeliveryOption) {
    setSelectedDelivery((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option],
    );
  }

  function parseNumber(val: string): number | undefined {
    const cleaned = val.replace(/,/g, "").trim();
    if (!cleaned) return undefined;
    const num = Number(cleaned);
    return isNaN(num) ? undefined : num;
  }

  function buildPayload(): CreatePartListingPayload {
    const title = partTitle.trim() || `${brand || "Genuine"} ${partName || "Part"}`.trim();
    const retail = parseNumber(retailPrice) ?? 0;
    const promotional = parseNumber(promotionalPrice);
    const fleet = parseNumber(fleetPrice);
    const parsedDown = parseNumber(downPayment);
    const parsedEmi = parseNumber(emi);

    const pricing: CreatePartListingPayload["pricing"] = {
      retail,
      ...(promotional !== undefined ? { promotional } : {}),
      ...(fleet !== undefined ? { fleet } : {}),
      ...(parsedDown !== undefined && parsedEmi !== undefined
        ? { financing: { downPayment: parsedDown, emi: parsedEmi } }
        : {}),
    };

    const compatibility = compatibilityInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    return {
      type: "PART",
      title,
      description: description || `Genuine ${title}`,
      pricing,
      partName: partName || title,
      partCategory,
      brand: brand || "Generic",
      inStock,
      vehicleCompatibility: compatibility.length > 0 ? compatibility : ["Universal"],
      deliveryOptions: selectedDelivery.length > 0 ? selectedDelivery : ["STANDARD"],
      ...(oemNumber.trim() ? { oemNumber: oemNumber.trim() } : {}),
      ...(warranty.trim() ? { warranty: warranty.trim() } : {}),
    };
  }

  async function processListingSubmission(shouldSubmit: boolean) {
    setError(null);
    setSuccessMessage(null);

    const retail = parseNumber(retailPrice);
    if (!retail || retail <= 0) {
      setError("Please enter a valid Retail Price for the part.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildPayload();
      console.log("[FORM SUBMIT] Creating part listing payload:", payload);

      // Step 1: Create part listing draft
      const response: unknown = await supplierPortalApi.createPartListing(payload);
      const responseRecord = isRecord(response) ? response : undefined;
      const dataRecord = isRecord(responseRecord?.data) ? responseRecord.data : undefined;
      const listingId =
        (typeof responseRecord?._id === "string" && responseRecord._id) ||
        (typeof dataRecord?._id === "string" && dataRecord._id);

      if (!listingId) {
        throw new Error("Failed to obtain created listing ID from server.");
      }

      // Step 2: Upload media files if any selected
      if (files.length > 0) {
        console.log(`[FORM SUBMIT] Uploading ${files.length} media files for listing ${listingId}...`);
        await supplierPortalApi.uploadListingMedia(listingId, files);
      }

      // Step 3: Submit for approval if "Publish Listing" clicked
      if (shouldSubmit) {
        console.log(`[FORM SUBMIT] Submitting listing ${listingId} for admin approval...`);
        await supplierPortalApi.submitListing(listingId);
        setSuccessMessage("Part listing created and submitted for admin review!");
      } else {
        setSuccessMessage("Part listing saved as draft!");
      }

      setTimeout(() => {
        router.push("/my-listings");
      }, 1500);
    } catch (err: unknown) {
      console.error("[FORM SUBMIT ERROR]", err);
      const payload = isRecord(err) && isRecord(err.payload) ? err.payload : undefined;
      const message = payload?.message;
      const msg =
        message
          ? Array.isArray(message)
            ? message.join(", ")
            : String(message)
          : err instanceof Error
            ? err.message
            : "Failed to save part listing. Please check your inputs.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <FormCard>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          processListingSubmission(true);
        }}
        className="space-y-8"
      >
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>{successMessage} Redirecting to your listings...</span>
          </div>
        )}

        <div>
          <SectionHeading>Part Details</SectionHeading>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <TextField
              label="Listing Title *"
              placeholder="e.g. Brembo High Performance Brake Pads"
              value={partTitle}
              onChange={(e) => setPartTitle(e.target.value)}
              required
            />
            <TextField
              label="Part Name *"
              placeholder="e.g. Ceramic Brake Pads"
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              required
            />
            <SelectField
              label="Part Category *"
              placeholder="Select Category"
              value={partCategory}
              onChange={(e) => setPartCategory(e.target.value)}
              options={PART_CATEGORIES}
              required
            />
            <TextField
              label="Brand / Manufacturer *"
              placeholder="e.g. Brembo, Bosch, Denso"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
            <TextField
              label="OEM Part Number (Optional)"
              placeholder="e.g. 04465-33160"
              value={oemNumber}
              onChange={(e) => setOemNumber(e.target.value)}
            />
            <TextField
              label="Warranty (Optional)"
              placeholder="e.g. 12 months, 1 year manufacturer warranty"
              value={warranty}
              onChange={(e) => setWarranty(e.target.value)}
            />
            <SegmentedToggle
              label="Availability / Stock Status"
              options={["In Stock", "Out of Stock"]}
              value={inStock ? "In Stock" : "Out of Stock"}
              onChange={(val) => setInStock(val === "In Stock")}
            />
            <TextField
              label="Vehicle Compatibility (Comma-separated)"
              placeholder="e.g. Toyota RAV4, Honda CR-V, Camry 2020-2024"
              value={compatibilityInput}
              onChange={(e) => setCompatibilityInput(e.target.value)}
            />
          </div>
        </div>

        <div>
          <SectionHeading>Pricing Details (NGN)</SectionHeading>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <TextField
              label="Retail Price (₦) *"
              placeholder="e.g. 35000"
              value={retailPrice}
              onChange={(e) => setRetailPrice(e.target.value)}
              required
            />
            <TextField
              label="Promotional Price (₦) (Optional)"
              placeholder="e.g. 32000"
              value={promotionalPrice}
              onChange={(e) => setPromotionalPrice(e.target.value)}
            />
            <TextField
              label="Fleet / Bulk Price (₦) (Optional)"
              placeholder="e.g. 30000"
              value={fleetPrice}
              onChange={(e) => setFleetPrice(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Financing Down Payment (₦)"
                placeholder="e.g. 5000"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
              />
              <TextField
                label="Monthly EMI (₦)"
                placeholder="e.g. 550"
                value={emi}
                onChange={(e) => setEmi(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <SectionHeading>Delivery Options &amp; Description</SectionHeading>
          <div className="flex flex-col gap-6">
            <div>
              <span className="mb-2.5 block text-sm font-semibold text-portal-ink">
                Supported Delivery Options
              </span>
              <div className="flex flex-wrap gap-3">
                {DELIVERY_OPTIONS.map((opt) => {
                  const isSelected = selectedDelivery.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleDeliveryToggle(opt.value)}
                      className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                        isSelected
                          ? "bg-portal-blue-600 text-white"
                          : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {opt.label} {isSelected ? "✓" : "+"}
                    </button>
                  );
                })}
              </div>
            </div>

            <TextAreaField
              label="Detailed Description"
              placeholder="Provide information on material specs, installation tips, warranty coverage..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <MediaUpload
          emoji="📸"
          maxPhotos={10}
          hint="Recommended resolution: 1920x1080. (JPG, PNG, MP4)"
          files={files}
          onFilesChange={setFiles}
        />

        <FormActions
          isSubmitting={isSubmitting}
          submitLabel="Publish Listing"
          onSaveDraft={() => processListingSubmission(false)}
          onCancel={() => router.push("/my-listings")}
        />
      </form>
    </FormCard>
  );
}
