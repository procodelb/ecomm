export type TrackEvent =
  | "page_view"
  | "product_view"
  | "add_to_cart"
  | "remove_from_cart"
  | "checkout_started"
  | "purchase"
  | "signup"
  | "login"
  | "wishlist_add"
  | "wishlist_remove"
  | "review_submit"
  | "support_ticket_created"
  | "search";

export type EventProperties = Record<string, string | number | boolean | string[] | undefined>;

export type PurchaseData = {
  transactionId: string;
  value: number;
  currency: string;
  items: Array<{ id: string; name: string; price: number; quantity: number; category?: string }>;
  shipping?: number;
  tax?: number;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (event: string, params?: Record<string, unknown>) => void };
    clarity?: (action: string, ...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
