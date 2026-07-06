export type Locale = "en-AE" | "en-AU" | "ar-AE";

export type Currency = "AED" | "AUD" | "USD";

export type Country = "AE" | "AU" | "US";

export interface LocalizedConfig {
  locale: Locale;
  currency: Currency;
  country: Country;
  language: string;
  region: string;
  timezone: string;
  currencySymbol: string;
  localeCode: string;
  taxRate: number;
  shippingZones: ShippingZone[];
}

export interface ShippingZone {
  name: string;
  regions: string[];
  rate: number;
  freeThreshold: number;
  estimatedDays: [number, number];
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  categories: string[];
  tags: string[];
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string | null;
  sku: string | null;
  title: string;
  variantTitle: string | null;
  attributes: Record<string, string>;
  price: number;
  quantity: number;
  image: string | null;
  locale: string;
  currency: Currency;
}

export interface Order {
  id: string;
  userId: string | null;
  email: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: Currency;
  status: OrderStatus;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  createdAt: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: Country;
}

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  locale: Locale;
}
