"use client";

import { analyticsConfig } from "./config";
import type { TrackEvent, EventProperties, PurchaseData } from "./types";
import { getConsent } from "./consent";

function getDefaultParams(): EventProperties {
  if (typeof window === "undefined") return {};
  return {
    page_location: window.location.href,
    page_title: document.title,
    page_referrer: document.referrer,
  };
}

function sendToGtag(event: TrackEvent, params?: EventProperties) {
  if (!analyticsConfig.ga4.enabled || typeof window.gtag !== "function") return;
  try {
    window.gtag("event", event, params);
  } catch { /* ignore */ }
}

function sendToMeta(event: TrackEvent, params?: EventProperties) {
  if (!analyticsConfig.meta.enabled || typeof window.fbq !== "function") return;
  try {
    const metaEvent = event === "purchase" ? "Purchase"
      : event === "add_to_cart" ? "AddToCart"
      : event === "checkout_started" ? "InitiateCheckout"
      : event === "signup" ? "CompleteRegistration"
      : event === "login" ? "Login"
      : event === "search" ? "Search"
      : event === "product_view" ? "ViewContent"
      : event === "wishlist_add" ? "AddToWishlist"
      : "PageView";
    window.fbq("track", metaEvent, params);
  } catch { /* ignore */ }
}

function sendToTiktok(event: TrackEvent, params?: EventProperties) {
  if (!analyticsConfig.tiktok.enabled || typeof window.ttq?.track !== "function") return;
  try {
    const ttEvent = event === "purchase" ? "PlaceAnOrder"
      : event === "add_to_cart" ? "AddToCart"
      : event === "checkout_started" ? "InitiateCheckout"
      : event === "signup" ? "CompleteRegistration"
      : event === "product_view" ? "ViewContent"
      : event === "wishlist_add" ? "AddToWishlist"
      : event === "search" ? "Search"
      : "PageView";
    window.ttq.track(ttEvent, params);
  } catch { /* ignore */ }
}

export function trackEvent(event: TrackEvent, params?: EventProperties) {
  if (typeof window === "undefined") return;
  const consent = getConsent();
  if (!consent.analytics && event !== "page_view") return;

  const defaults = getDefaultParams();
  const merged = { ...defaults, ...params };

  sendToGtag(event, merged);
  sendToMeta(event, merged);
  sendToTiktok(event, merged);
}

export function trackPurchase(data: PurchaseData) {
  if (typeof window === "undefined") return;
  const consent = getConsent();
  if (!consent.analytics) return;

  const params: EventProperties = {
    currency: data.currency,
    value: data.value,
    transaction_id: data.transactionId,
    items: data.items.map((i) => `${i.id}:${i.quantity}`),
  };

  const gtagParams: Record<string, unknown> = {
    ...params,
    currency: data.currency,
    value: data.value,
    transaction_id: data.transactionId,
    items: data.items,
    shipping: data.shipping,
    tax: data.tax,
  };

  if (analyticsConfig.ga4.enabled && typeof window.gtag === "function") {
    try {
      window.gtag("event", "purchase", gtagParams);
    } catch { /* ignore */ }
  }
  sendToMeta("purchase", params);
  sendToTiktok("purchase", params);
}

export function trackPageView(url?: string) {
  if (typeof window === "undefined") return;
  const consent = getConsent();
  if (!consent.analytics && !consent.necessary) return;

  const params: EventProperties = {
    page_location: url || window.location.href,
    page_title: document.title,
  };
  sendToGtag("page_view", params);
  sendToMeta("page_view", params);
}

export function trackProductView(productId: string, name: string, price: number, currency: string, category?: string) {
  trackEvent("product_view", {
    content_type: "product",
    content_ids: [productId],
    content_name: name,
    value: price,
    currency,
    content_category: category,
  });
}
