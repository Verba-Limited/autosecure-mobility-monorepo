import { PortalShell } from "@/components/portal/PortalShell";
import { PageHeader } from "@/components/portal/PageHeader";
import { FormCard } from "@/components/forms/FormCard";
import { SectionHeading } from "@/components/forms/SectionHeading";
import { TextField, SelectField, TextAreaField } from "@/components/forms/Field";
import { SegmentedToggle } from "@/components/forms/SegmentedToggle";
import { FeatureChecklist } from "@/components/forms/FeatureChecklist";
import { MediaUpload } from "@/components/forms/MediaUpload";
import { FormActions } from "@/components/forms/FormActions";

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
];

export default function ListNewCarPage() {
  return (
    <PortalShell>
      <PageHeader
        title="List New Car"
        description="Fill in the details below to add a brand new vehicle to your inventory."
      />

      <FormCard>
        <div>
          <SectionHeading>Basic Information</SectionHeading>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <TextField label="Car Make & Model" placeholder="e.g. BMW 5 Series 530i" />
            <SelectField
              label="Year"
              placeholder="Select Year"
              options={["2026", "2025", "2024", "2023"]}
            />
            <SelectField
              label="Body Type"
              placeholder="Select Body Type"
              options={["Sedan", "SUV", "Coupe", "Hatchback", "Pickup", "Van"]}
            />
            <TextField label="Price (₦)" placeholder="e.g. 45,000,000" />
          </div>
        </div>

        <div>
          <SectionHeading>Technical Specifications</SectionHeading>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <SegmentedToggle label="Transmission" options={["Automatic", "Manual"]} />
            <SelectField
              label="Fuel Type"
              placeholder="Select Fuel Type"
              options={["Petrol", "Diesel", "Hybrid", "Electric"]}
            />
            <TextField label="Engine Capacity" placeholder="e.g. 2.0L or 1998cc" />
            <TextField label="Exterior Color" placeholder="e.g. Metallic Black" />
            <TextField label="Interior Color" placeholder="e.g. Beige Leather" />
          </div>
        </div>

        <div>
          <SectionHeading>Features &amp; Details</SectionHeading>
          <div className="flex flex-col gap-6">
            <FeatureChecklist features={KEY_FEATURES} />
            <TextAreaField
              label="Detailed Description"
              placeholder="Provide a detailed description of the car, packages, warranties, etc."
              rows={4}
            />
          </div>
        </div>

        <MediaUpload
          emoji="📸"
          maxPhotos={10}
          hint="Recommended resolution: 1920x1080. (JPG, PNG)"
        />

        <FormActions />
      </FormCard>
    </PortalShell>
  );
}
