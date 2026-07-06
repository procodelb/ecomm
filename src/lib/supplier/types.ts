// ── Normalized product from any supplier ───────────────────────────────
export interface NormalizedProduct {
  supplierSku: string;
  supplierId: string;
  title: string;
  description: string;
  price: number;
  comparePrice: number | null;
  currency: string;
  stock: number;
  moq: number;
  images: string[];
  category: string;
  subcategory: string | null;
  tags: string[];
  shippingMethods: NormalizedShippingMethod[];
  leadTimeMin: number;
  leadTimeMax: number;
  weightKg: number | null;
  dimensionsCm: { length: number; width: number; height: number } | null;
  attributes: Record<string, string>;
  variants: NormalizedVariant[];
  hsCode: string | null;
  countryOfOrigin: string | null;
}

export interface NormalizedVariant {
  supplierSku: string;
  title: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  attributes: Record<string, string>;
  images: string[];
  weightKg: number | null;
}

// ── Stock / price snapshot ─────────────────────────────────────────────
export interface NormalizedStock {
  sku: string;
  available: number;
  reserved: number;
  price: number;
  currency: string;
  updatedAt: string;
}

// ── Shipping method ────────────────────────────────────────────────────
export interface NormalizedShippingMethod {
  name: string;
  code: string;
  price: number;
  currency: string;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
}

// ── Order dispatch ─────────────────────────────────────────────────────
export interface SupplierOrderDispatch {
  orderId: string;
  orderNumber: string;
  supplierId: string;
  items: SupplierOrderDispatchItem[];
  shippingAddress: Record<string, unknown>;
  locale: string;
  currency: string;
}

export interface SupplierOrderDispatchItem {
  supplierSku: string;
  title: string;
  quantity: number;
  unitPrice: number;
}

export interface SupplierOrderResult {
  supplierOrderId: string;
  status: "confirmed" | "pending" | "rejected" | "error";
  trackingNumber: string | null;
  estimatedDelivery: string | null;
  errorMessage: string | null;
  rawResponse: Record<string, unknown>;
}

export interface SupplierOrderStatus {
  supplierOrderId: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "error";
  trackingNumber: string | null;
  carrier: string | null;
  estimatedDelivery: string | null;
  events: SupplierStatusEvent[];
}

// ── Tracking ───────────────────────────────────────────────────────────
export interface NormalizedTracking {
  trackingNumber: string;
  carrier: string;
  status: "pending" | "in_transit" | "delivered" | "exception" | "returned";
  events: TrackingEvent[];
  estimatedDelivery: string | null;
  origin: string | null;
  destination: string | null;
}

export interface TrackingEvent {
  date: string;
  location: string;
  description: string;
  status: string;
}

export interface SupplierStatusEvent {
  date: string;
  status: string;
  description: string;
  location: string | null;
}

// ── Adapter capabilities ───────────────────────────────────────────────
export type SyncCapability = "products" | "stock" | "orders" | "tracking";

export interface SupplierAdapterCapabilities {
  realtimeProducts: boolean;
  realtimeStock: boolean;
  realtimeOrders: boolean;
  realtimeTracking: boolean;
  supportedSync: SyncCapability[];
}
