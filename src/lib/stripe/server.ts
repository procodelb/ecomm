import "server-only";

import Stripe from "stripe";
import { resolvePaymentsMode, type PaymentsMode } from "@/lib/utils/env";

function createStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "PLACEHOLDER") {
    return null;
  }
  return new Stripe(key, {
    apiVersion: "2026-06-24.dahlia",
    typescript: true,
  });
}

/** Real Stripe client — null when keys are PLACEHOLDER. */
export const stripe = createStripe();

let _paymentsMode: PaymentsMode | null = null;

/**
 * Lazily resolved payments mode. Throws on misconfiguration.
 * Computed once, cached for the lifetime of the serverless function.
 */
export function getPaymentsMode(): PaymentsMode {
  if (!_paymentsMode) {
    _paymentsMode = resolvePaymentsMode();
  }
  return _paymentsMode;
}

/** Whether the system should use the real Stripe API (sandbox or live). */
export function getUseRealStripe(): boolean {
  const mode = getPaymentsMode();
  return mode.kind === "sandbox" || mode.kind === "live";
}
