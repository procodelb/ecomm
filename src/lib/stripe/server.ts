import "server-only";

import Stripe from "stripe";
import { isStripeTestMode } from "@/lib/utils/env";

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

export const stripe = createStripe();

/** True when the app should bypass Stripe APIs and create orders directly. */
export const stripeTestMode = isStripeTestMode();
