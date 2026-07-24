// Shared domain types used across apps (landing, supplier-portal, admin).
// Keep these in sync with the Express backend's models.

export type UserRole = "customer" | "supplier" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  whatsappNumber?: string;
}

export interface Supplier {
  id: string;
  businessName: string;
  contactPerson: string;
  verified: boolean;
}

export interface Product {
  id: string;
  supplierId: string;
  category: "brand-new" | "used" | "aftermarket-parts";
  title: string;
  price: number;
  status: "draft" | "published" | "archived";
}

export interface Order {
  id: string;
  productId: string;
  customerId: string;
  supplierId: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
}
