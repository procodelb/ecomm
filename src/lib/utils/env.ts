import { redirect } from "next/navigation";

export type PaymentsMode =
  | { kind: "live" }
  | { kind: "sandbox" }
  | { kind: "mock" };

/**
 * The active payment provider. Defaults to "cash_on_delivery".
 */
export function getActivePaymentProvider(): "cash_on_delivery" | "alfan" | "stripe" {
  const raw = (process.env.PAYMENT_PROVIDER ?? "cash_on_delivery").trim().toLowerCase();
  if (raw === "alfan" || raw === "stripe") return raw;
  return "cash_on_delivery";
}

/**
 * Whether Stripe API keys are configured and are real keys (not PLACEHOLDER).
 */
export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  return (
    key !== "" &&
    key !== "PLACEHOLDER" &&
    pubKey !== "" &&
    pubKey !== "PLACEHOLDER"
  );
}

/**
 * Whether Stripe keys are test-mode (sk_test_ / pk_test_).
 * This means the REAL Stripe API is used in sandbox — NOT a mock bypass.
 */
export function isStripeSandbox(): boolean {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  return key.startsWith("sk_test_") && pubKey.startsWith("pk_test_");
}

/**
 * Whether Stripe keys are live-mode (sk_live_ / pk_live_).
 */
export function isStripeLive(): boolean {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  return key.startsWith("sk_live_") && pubKey.startsWith("pk_live_");
}

/**
 * Whether the explicit mock-payment mode is enabled.
 * Only allowed in local development. NEVER in production or preview.
 *
 * Requires PAYMENTS_MOCK_MODE=true AND Stripe keys set to PLACEHOLDER.
 */
export function isMockPaymentsEnabled(): boolean {
  const mockFlag = process.env.PAYMENTS_MOCK_MODE === "true";
  if (!mockFlag) return false;

  // In production/preview, mock mode is forbidden even if env var is set.
  if (process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview") {
    return false;
  }

  return true;
}

/**
 * Returns the resolved payments mode with startup validation.
 * Throws on invalid configurations (mixed keys, mock in prod, etc.).
 *
 * When the active payment provider is not "stripe", this always returns "mock"
 * without requiring Stripe keys, so the checkout page can render for COD/Alfan.
 */
export function resolvePaymentsMode(): PaymentsMode {
  const provider = getActivePaymentProvider();

  // When using COD or Alfan (not Stripe), skip Stripe validation entirely
  if (provider !== "stripe") {
    return { kind: "mock" };
  }

  const key = process.env.STRIPE_SECRET_KEY ?? "";
  const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

  const isPlaceholder = key === "PLACEHOLDER" || pubKey === "PLACEHOLDER";
  const hasTestPrefix = key.startsWith("sk_test_") || pubKey.startsWith("pk_test_");
  const hasLivePrefix = key.startsWith("sk_live_") || pubKey.startsWith("pk_live_");

  // ── Mixed-mode rejection ──
  if (key.startsWith("sk_test_") && pubKey.startsWith("pk_live_")) {
    throw new Error(
      "Stripe configuration error: sk_test_ secret key cannot be used with pk_live_ publishable key. Both must be from the same mode."
    );
  }
  if (key.startsWith("sk_live_") && pubKey.startsWith("pk_test_")) {
    throw new Error(
      "Stripe configuration error: sk_live_ secret key cannot be used with pk_test_ publishable key. Both must be from the same mode."
    );
  }

  // ── Mock mode ──
  if (isPlaceholder && isMockPaymentsEnabled()) {
    return { kind: "mock" };
  }

  // ── Keys are PLACEHOLDER but mock not enabled → reject ──
  if (isPlaceholder && !isMockPaymentsEnabled()) {
    // Allow checkout page to render in development for UI testing
    if (process.env.NODE_ENV === "development") {
      return { kind: "mock" };
    }
    throw new Error(
      "Stripe keys are set to PLACEHOLDER but PAYMENTS_MOCK_MODE is not enabled. Configure real Stripe keys or enable PAYMENTS_MOCK_MODE for local development."
    );
  }

  // ── Real keys ──
  if (hasTestPrefix) {
    // Validate same mode
    if (pubKey && !pubKey.startsWith("pk_test_")) {
      throw new Error(
        "Stripe configuration error: sk_test_ secret key requires pk_test_ publishable key."
      );
    }
    return { kind: "sandbox" };
  }

  if (hasLivePrefix) {
    // Validate same mode
    if (pubKey && !pubKey.startsWith("pk_live_")) {
      throw new Error(
        "Stripe configuration error: sk_live_ secret key requires pk_live_ publishable key."
      );
    }

    // Reject mock mode with live keys
    if (isMockPaymentsEnabled()) {
      throw new Error(
        "PAYMENTS_MOCK_MODE cannot be enabled with live Stripe keys."
      );
    }

    return { kind: "live" };
  }

  // ── Keys present but unrecognized prefix ──
  if (key && pubKey) {
    throw new Error(
      `Stripe configuration error: unrecognized key prefix. Secret key starts with "${key.slice(0, 7)}...", publishable key starts with "${pubKey.slice(0, 7)}...". Expected sk_test_/sk_live_ and pk_test_/pk_live_.`
    );
  }

  // ── No keys at all ──
  if (process.env.NODE_ENV === "development") {
    return { kind: "mock" };
  }
  throw new Error("Stripe keys are not configured.");
}

/**
 * Redirects to home when Stripe is the active provider but not configured.
 * No longer redirects when using cash_on_delivery or alfan.
 */
export function redirectIfNotSet() {
  const provider = getActivePaymentProvider();
  if (provider !== "stripe") {
    return; // COD and Alfan don't need Stripe keys
  }
  try {
    const mode = resolvePaymentsMode();
    if (mode.kind === "mock" && process.env.NODE_ENV !== "development") {
      redirect("/");
    }
  } catch {
    redirect("/");
  }
}
