import { PortalShell } from "@/components/portal/PortalShell";
import { PageHeader } from "@/components/portal/PageHeader";
import { FormCard } from "@/components/forms/FormCard";
import { SectionHeading } from "@/components/forms/SectionHeading";
import { TextField, SelectField, TextAreaField } from "@/components/forms/Field";
import { MediaUpload } from "@/components/forms/MediaUpload";
import { FormActions } from "@/components/forms/FormActions";

export default function ListPartPage() {
  return (
    <PortalShell>
      <PageHeader
        title="List a Part"
        description="Fill in the details below to add auto parts, accessories, or spare components."
      />

      <FormCard>
        <div>
          <SectionHeading>Part Information</SectionHeading>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <TextField label="Part Title / Name" placeholder="e.g. 18” Alloy Wheel Set" />
            <TextField
              label="Part / OEM Number (Optional)"
              placeholder="e.g. OEM-34116850885"
            />
            <SelectField
              label="Category"
              placeholder="Select Category"
              options={["Engine", "Suspension", "Brakes", "Electrical", "Body & Exterior", "Interior"]}
            />
            <SelectField
              label="Condition"
              placeholder="Select Condition"
              options={["Brand New", "Used - Excellent", "Used - Good", "Refurbished"]}
            />
            <TextField label="Price (₦)" placeholder="e.g. 243,000" />
            <TextField
              label="Brand / Manufacturer"
              placeholder="e.g. Brembo, Michelin, Bosch, BMW OEM"
            />
          </div>
        </div>

        <div>
          <SectionHeading>Vehicle Compatibility</SectionHeading>
          <TextAreaField
            label="Compatible Vehicles"
            placeholder="List vehicles this part fits. e.g. Toyota Camry 2018-2024, Toyota RAV4 2019-2023."
            rows={3}
          />
        </div>

        <div>
          <SectionHeading>Detailed Description</SectionHeading>
          <TextAreaField
            label="Item Description"
            placeholder="Describe the item's material, dimensions, specs, package contents, and installation details."
            rows={5}
          />
        </div>

        <MediaUpload
          emoji="📦"
          maxPhotos={6}
          hint="Include close-ups of serial numbers or labels where applicable."
        />

        <FormActions />
      </FormCard>
    </PortalShell>
  );
}
