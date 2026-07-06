import { redirect } from "next/navigation";

/**
 * Returns true when Stripe keys are set to "PLACEHOLDER" — the app runs
 * in test mode, creating orders directly without calling Stripe APIs.
 */
export function isStripeTestMode(): boolean {
  return (
    process.env.STRIPE_SECRET_KEY === "PLACEHOLDER" ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY === "PLACEHOLDER"
  );
}

/**
 * Redirects to home when Stripe keys are truly absent (not even placeholders).
 * Placeholder keys are allowed so the checkout page can render in test mode.
 */
export function redirectIfNotSet() {
  const hasRealKey =
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY !== "PLACEHOLDER" &&
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_SECRET_KEY !== "PLACEHOLDER";

  if (!hasRealKey && !isStripeTestMode()) {
    redirect("/");
  }
}
