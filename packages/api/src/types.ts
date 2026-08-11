export type UserRole = "CUSTOMER" | "SUPPLIER" | "ADMIN";

export type ListingType = "BRAND_NEW_CAR" | "USED_CAR" | "PART";

export type ListingStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "ARCHIVED";

export type VehicleCondition = "NEW" | "USED";

export type Transmission = "AUTOMATIC" | "MANUAL";

export type FuelType = "PETROL" | "DIESEL" | "HYBRID" | "ELECTRIC";

export type DeliveryOption = "STANDARD" | "NEXT_DAY" | "ECONOMY";

export type Pricing = {
  retail: number;
  promotional?: number;
  fleet?: number;
  financing?: {
    downPayment: number;
    emi: number;
  };
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type RegisterCustomerPayload = {
  email: string;
  password: string;
  role: "CUSTOMER";
  firstName: string;
  lastName: string;
};

export type RegisterSupplierPayload = {
  email: string;
  password: string;
  role: "SUPPLIER";
  firstName: string;
  lastName: string;
  companyName: string;
};

export type VerifyEmailPayload = {
  email: string;
  otp: string;
};

export type ResendOtpPayload = {
  email: string;
  purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET";
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type CreateCarListingPayload = {
  type: "BRAND_NEW_CAR" | "USED_CAR";
  title: string;
  description: string;
  pricing: Pricing;
  dealBadges?: string[];
  brand: string;
  model: string;
  year: number;
  condition: VehicleCondition;
  transmission: Transmission;
  fuelType: FuelType;
  mileage?: number;
  engineCapacity?: string;
  horsepower?: string;
  engineType?: string;
  driveType?: string;
  topSpeed?: string;
  fuelEconomy?: string;
  bodyType?: string;
  inStock?: boolean;
  color: string;
  seatingCapacity: number;
  keyFeatures?: string[];
};

export type CreatePartListingPayload = {
  type: "PART";
  title: string;
  description: string;
  pricing: Pricing;
  partName: string;
  partCategory: string;
  oemNumber?: string;
  brand: string;
  inStock: boolean;
  vehicleCompatibility: string[];
  warranty?: string;
  deliveryOptions: DeliveryOption[];
};

export type InquiryPayload = {
  customerPhone: string;
  customerEmail: string;
};

export type RejectListingPayload = {
  reason: string;
};

export type ConfigItemPayload = {
  type:
    | "VEHICLE_BRAND"
    | "VEHICLE_MODEL"
    | "VEHICLE_CATEGORY"
    | "PART_CATEGORY"
    | "DELIVERY_OPTION"
    | "PRICING_RULE";
  value: string;
  metadata?: string;
};
