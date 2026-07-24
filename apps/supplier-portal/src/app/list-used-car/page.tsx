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

export default function ListUsedCarPage() {
  return (
    <PortalShell>
      <PageHeader
        title="List Used Car"
        description="Fill in the details below to add a registered or pre-owned vehicle to your inventory."
      />

      <FormCard>
        <div>
          <SectionHeading>Basic Information</SectionHeading>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <TextField label="Car Make & Model" placeholder="e.g. Mercedes-Benz C300" />
            <TextField label="Year" placeholder="2022" />
            <TextField label="Body Type" placeholder="Sedan" />
            <TextField label="Price (₦)" placeholder="e.g. 16,500,000" />
          </div>
        </div>

        <div>
          <SectionHeading>Condition &amp; History</SectionHeading>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <SelectField
              label="Condition / Import Type"
              placeholder="Select Condition"
              options={["Nigerian Used", "Foreign Used", "Registered"]}
            />
            <TextField label="Mileage (km)" placeholder="e.g. 64,200" />
            <TextField label="Number of Previous Owners" placeholder="e.g. 1" />
            <TextField
              label="Registration Number (Optional)"
              placeholder="e.g. LAGOS-KJA-123AA"
            />
          </div>
        </div>

        <div>
          <SectionHeading>Technical Specifications</SectionHeading>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <SegmentedToggle label="Transmission" options={["Automatic", "Manual"]} />
            <TextField label="Fuel Type" placeholder="Petrol" />
            <TextField label="Engine Capacity" placeholder="e.g. 2.0L Turbo" />
            <TextField label="Exterior Color" placeholder="e.g. Polar White" />
            <TextField label="Interior Color" placeholder="e.g. Black Leather" />
          </div>
        </div>

        <div>
          <SectionHeading>Features &amp; Details</SectionHeading>
          <div className="flex flex-col gap-6">
            <FeatureChecklist
              features={KEY_FEATURES}
              defaultChecked={[
                "Sunroof",
                "Leather Seats",
                "Navigation System",
                "Apple CarPlay / Android Auto",
                "Keyless Entry",
                "Backup Camera",
                "Bluetooth",
                "Parking Sensors",
              ]}
            />
            <TextAreaField
              label="Detailed Description"
              placeholder="Describe the vehicle's condition, upgrades, servicing history, etc."
              rows={4}
            />
            <TextAreaField
              label="Known Defects / Faults (Optional)"
              placeholder="e.g. Light scratch on rear bumper, minor rim scuffing. Transparency builds buyer trust."
              rows={3}
            />
          </div>
        </div>

        <MediaUpload
          emoji="📷"
          maxPhotos={12}
          hint="Show all angles of the car (exterior, interior, engine, defects)."
        />

        <FormActions />
      </FormCard>
    </PortalShell>
  );
}
