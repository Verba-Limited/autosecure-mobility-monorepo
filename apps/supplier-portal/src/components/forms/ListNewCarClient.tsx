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
import { FeatureChecklist } from "@/components/forms/FeatureChecklist";
import { MediaUpload } from "@/components/forms/MediaUpload";
import { FormActions } from "@/components/forms/FormActions";
import { supplierPortalApi } from "@/lib/supplier-api";
import type { CreateCarListingPayload, FuelType, Transmission } from "@autosecure/api";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const KEY_FEATURES = [
  "Sunroof",
  "Leather Seats",
  "Navigation System",
  "Apple CarPlay / Android Auto",
  "Keyless Entry",
  "Backup Camera",
  "Blind Spot Monitor",
  "Bluetooth",
  "Parking Sensors",
  "Adaptive Cruise Control",
  "Lane Assist",
  "360° Camera",
  "Panoramic Sunroof",
  "JBL Premium Sound",
  "Heated Seats",
];

const DEAL_BADGE_OPTIONS = [
  "Hot Deal",
  "Certified Used",
  "0% APR",
];

const DRIVE_TYPE_OPTIONS = [
  { value: "4WD", label: "4WD" },
  { value: "AWD", label: "AWD" },
  { value: "FWD", label: "FWD" },
  { value: "RWD", label: "RWD" },
];

export function ListNewCarClient() {
  const router = useRouter();

  // Basic Info State
  const [brand, setBrand] = useState("Toyota");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("2026");
  const [bodyType, setBodyType] = useState("Sedan");

  // Pricing State
  const [retailPrice, setRetailPrice] = useState("");
  const [promotionalPrice, setPromotionalPrice] = useState("");
  const [fleetPrice, setFleetPrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [emi, setEmi] = useState("");

  // Specs State
  const [transmission, setTransmission] = useState<Transmission>("AUTOMATIC");
  const [fuelType, setFuelType] = useState<FuelType>("PETROL");
  const [engineCapacity, setEngineCapacity] = useState("");
  const [engineType, setEngineType] = useState("");
  const [horsepower, setHorsepower] = useState("");
  const [driveType, setDriveType] = useState("4WD");
  const [topSpeed, setTopSpeed] = useState("");
  const [fuelEconomy, setFuelEconomy] = useState("");
  const [color, setColor] = useState("");
  const [interiorColor, setInteriorColor] = useState("");
  const [seatingCapacity, setSeatingCapacity] = useState("5");
  const [inStock, setInStock] = useState(true);

  // Features & Description State
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [description, setDescription] = useState("");

  // Media State
  const [files, setFiles] = useState<File[]>([]);

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleFeatureToggle(feature: string) {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((item) => item !== feature)
        : [...prev, feature],
    );
  }

  function handleBadgeToggle(badge: string) {
    setSelectedBadges((prev) =>
      prev.includes(badge)
        ? prev.filter((item) => item !== badge)
        : [...prev, badge],
    );
  }

  function parseNumber(val: string): number | undefined {
    const cleaned = val.replace(/,/g, "").trim();
    if (!cleaned) return undefined;
    const num = Number(cleaned);
    return isNaN(num) ? undefined : num;
  }

  function buildPayload(): CreateCarListingPayload {
    const derivedBrand = brand || "Vehicle";
    const derivedModel = model || "Car";
    const title = `${year} ${derivedBrand} ${derivedModel}`.trim();

    const retail = parseNumber(retailPrice) ?? 0;
    const promotional = parseNumber(promotionalPrice);
    const fleet = parseNumber(fleetPrice);
    const parsedDown = parseNumber(downPayment);
    const parsedEmi = parseNumber(emi);

    const pricing: CreateCarListingPayload["pricing"] = {
      retail,
      ...(promotional !== undefined ? { promotional } : {}),
      ...(fleet !== undefined ? { fleet } : {}),
      ...(parsedDown !== undefined && parsedEmi !== undefined
        ? { financing: { downPayment: parsedDown, emi: parsedEmi } }
        : {}),
    };

    const fullDescription = [
      description,
      interiorColor ? `Interior: ${interiorColor}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    return {
      type: "BRAND_NEW_CAR",
      title,
      description: fullDescription || `Brand new ${title}`,
      pricing,
      dealBadges: selectedBadges,
      brand: derivedBrand,
      model: derivedModel,
      year: parseNumber(year) ?? 2026,
      condition: "NEW",
      transmission,
      fuelType,
      color: color || "Standard",
      seatingCapacity: parseNumber(seatingCapacity) ?? 5,
      bodyType,
      inStock,
      keyFeatures: selectedFeatures.length > 0 ? selectedFeatures : undefined,
      ...(engineCapacity ? { engineCapacity } : {}),
      ...(engineType ? { engineType } : {}),
      ...(horsepower ? { horsepower } : {}),
      ...(driveType ? { driveType } : {}),
      ...(topSpeed ? { topSpeed } : {}),
      ...(fuelEconomy ? { fuelEconomy } : {}),
    };
  }

  async function processListingSubmission(shouldSubmit: boolean) {
    setError(null);
    setSuccessMessage(null);

    const retail = parseNumber(retailPrice);
    if (!retail || retail <= 0) {
      setError("Please enter a valid Retail Price for the car.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildPayload();
      console.log("[FORM SUBMIT] Creating car listing payload:", payload);

      const response = (await supplierPortalApi.createCarListing(payload)) as {
        _id?: string;
        data?: { _id?: string };
      };
      const listingId = response?._id ?? response?.data?._id;

      if (!listingId) {
        throw new Error("Failed to obtain created listing ID from server.");
      }

      if (files.length > 0) {
        await supplierPortalApi.uploadListingMedia(listingId, files);
      }

      if (shouldSubmit) {
        await supplierPortalApi.submitListing(listingId);
        setSuccessMessage("Vehicle listing created and submitted for admin review!");
      } else {
        setSuccessMessage("Vehicle listing saved as draft!");
      }

      setTimeout(() => {
        router.push("/my-listings");
      }, 1500);
    } catch (err: unknown) {
      console.error("[FORM SUBMIT ERROR]", err);
      const errorObj = err as {
        payload?: { message?: unknown };
        message?: unknown;
      };
      const msg =
        errorObj.payload?.message
          ? Array.isArray(errorObj.payload.message)
            ? errorObj.payload.message.join(", ")
            : String(errorObj.payload.message)
          : typeof errorObj.message === "string"
          ? errorObj.message
          : "Failed to save car listing. Please check your inputs.";
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

        {/* ── Basic Information ─────────────────────────────── */}
        <div>
          <SectionHeading>Basic Information</SectionHeading>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <SelectField
              label="Brand / Make *"
              placeholder="Select Brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              options={[
                "Toyota", "BMW", "Mercedes-Benz", "Honda", "Ford",
                "Audi", "Lexus", "Hyundai", "Kia", "Nissan",
                "Land Rover", "Porsche", "Volkswagen", "Chevrolet",
                "Jeep", "Jaguar", "Volvo", "Mazda", "Mitsubishi",
              ]}
              required
            />
            <TextField
              label="Model Name / Series *"
              placeholder="e.g. Camry XSE, 5 Series 530i"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />
            <SelectField
              label="Year *"
              placeholder="Select Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              options={["2026", "2025", "2024", "2023"]}
              required
            />
            <SelectField
              label="Body Type *"
              placeholder="Select Body Type"
              value={bodyType}
              onChange={(e) => setBodyType(e.target.value)}
              options={["Sedan", "SUV", "Coupe", "Hatchback", "Pickup", "Van", "Convertible", "Wagon"]}
              required
            />
          </div>
        </div>

        {/* ── Pricing Details ───────────────────────────────── */}
        <div>
          <SectionHeading>Pricing Details (NGN)</SectionHeading>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <TextField
              label="Retail Price (₦) *"
              placeholder="e.g. 45000000"
              value={retailPrice}
              onChange={(e) => setRetailPrice(e.target.value)}
              required
            />
            <TextField
              label="Promotional Price (₦) (Optional)"
              placeholder="e.g. 42000000"
              value={promotionalPrice}
              onChange={(e) => setPromotionalPrice(e.target.value)}
            />
            <TextField
              label="Fleet Price (₦) (Optional)"
              placeholder="e.g. 40000000"
              value={fleetPrice}
              onChange={(e) => setFleetPrice(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Financing Down Payment (₦)"
                placeholder="e.g. 5000000"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
              />
              <TextField
                label="Monthly EMI (₦)"
                placeholder="e.g. 550000"
                value={emi}
                onChange={(e) => setEmi(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── Technical Specifications ──────────────────────── */}
        <div>
          <SectionHeading>Technical Specifications</SectionHeading>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <SegmentedToggle
              label="Transmission *"
              options={["Automatic", "Manual"]}
              value={transmission === "AUTOMATIC" ? "Automatic" : "Manual"}
              onChange={(val) =>
                setTransmission(val === "Automatic" ? "AUTOMATIC" : "MANUAL")
              }
            />
            <SelectField
              label="Fuel Type *"
              placeholder="Select Fuel Type"
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value as FuelType)}
              options={[
                { value: "PETROL", label: "Petrol" },
                { value: "DIESEL", label: "Diesel" },
                { value: "HYBRID", label: "Hybrid" },
                { value: "ELECTRIC", label: "Electric" },
              ]}
              required
            />
            <TextField
              label="Engine Capacity"
              placeholder="e.g. 2.0L or 1998cc"
              value={engineCapacity}
              onChange={(e) => setEngineCapacity(e.target.value)}
            />
            <TextField
              label="Engine Type"
              placeholder="e.g. 3.5L V6 Twin Turbo"
              value={engineType}
              onChange={(e) => setEngineType(e.target.value)}
            />
            <TextField
              label="Horsepower"
              placeholder="e.g. 409 hp"
              value={horsepower}
              onChange={(e) => setHorsepower(e.target.value)}
            />
            <SelectField
              label="Drive Type"
              placeholder="Select Drive Type"
              value={driveType}
              onChange={(e) => setDriveType(e.target.value)}
              options={DRIVE_TYPE_OPTIONS}
            />
            <TextField
              label="Top Speed"
              placeholder="e.g. 210 km/h"
              value={topSpeed}
              onChange={(e) => setTopSpeed(e.target.value)}
            />
            <TextField
              label="Fuel Economy"
              placeholder="e.g. 10.5 km/l"
              value={fuelEconomy}
              onChange={(e) => setFuelEconomy(e.target.value)}
            />
            <TextField
              label="Exterior Color *"
              placeholder="e.g. Midnight Black"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
            <TextField
              label="Interior Color"
              placeholder="e.g. Beige Leather"
              value={interiorColor}
              onChange={(e) => setInteriorColor(e.target.value)}
            />
            <TextField
              label="Seating Capacity *"
              placeholder="e.g. 5"
              type="number"
              value={seatingCapacity}
              onChange={(e) => setSeatingCapacity(e.target.value)}
            />
            <SegmentedToggle
              label="Stock Status"
              options={["In Stock", "Out of Stock"]}
              value={inStock ? "In Stock" : "Out of Stock"}
              onChange={(val) => setInStock(val === "In Stock")}
            />
          </div>
        </div>

        {/* ── Badges, Key Features & Description ───────────── */}
        <div>
          <SectionHeading>Promotional Badges &amp; Features</SectionHeading>
          <div className="flex flex-col gap-6">
            <div>
              <span className="mb-2.5 block text-sm font-semibold text-portal-ink">
                Deal Badges
              </span>
              <div className="flex flex-wrap gap-2">
                {DEAL_BADGE_OPTIONS.map((badge) => {
                  const isSelected = selectedBadges.includes(badge);
                  return (
                    <button
                      key={badge}
                      type="button"
                      onClick={() => handleBadgeToggle(badge)}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                        isSelected
                          ? "bg-portal-blue-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {badge} {isSelected ? "✓" : "+"}
                    </button>
                  );
                })}
              </div>
            </div>

            <FeatureChecklist
              features={KEY_FEATURES}
              selected={selectedFeatures}
              onToggle={handleFeatureToggle}
            />

            <TextAreaField
              label="Detailed Description"
              placeholder="Provide a detailed description of the vehicle, packages, trim levels, and warranty coverage..."
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
