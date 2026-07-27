import "server-only";

export type PaymentProvider = "cash_on_delivery" | "alfan" | "stripe";

const VALID_PROVIDERS: PaymentProvider[] = ["cash_on_delivery", "alfan", "stripe"];

function resolvePaymentProvider(): PaymentProvider {
  const raw = (process.env.PAYMENT_PROVIDER ?? "cash_on_delivery").trim().toLowerCase();
  if (VALID_PROVIDERS.includes(raw as PaymentProvider)) {
    return raw as PaymentProvider;
  }
  return "cash_on_delivery";
}

export function getPaymentProvider(): PaymentProvider {
  return resolvePaymentProvider();
}

export function isStripeEnabled(): boolean {
  const provider = getPaymentProvider();
  if (provider !== "stripe") return false;

  const secret = process.env.STRIPE_SECRET_KEY ?? "";
  const publishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  const webhook = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  return (
    secret !== "" &&
    secret !== "PLACEHOLDER" &&
    publishable !== "" &&
    publishable !== "PLACEHOLDER" &&
    webhook !== "" &&
    webhook !== "PLACEHOLDER"
  );
}

export function isAlfanEnabled(): boolean {
  const provider = getPaymentProvider();
  if (provider !== "alfan" && provider !== "cash_on_delivery") {
    // Alfan is only available when explicitly set as provider or alongside COD
    // When provider is "alfan", show Alfan button
    // When provider is "cash_on_delivery", still check if ALFAN_PAYMENT_URL is set for optional display
  }
  const url = process.env.ALFAN_PAYMENT_URL?.trim();
  return !!url && url.length > 0;
}

export function getAlfanPaymentUrl(): string | null {
  const url = process.env.ALFAN_PAYMENT_URL?.trim();
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    return parsed.origin + parsed.pathname + parsed.search;
  } catch {
    return null;
  }
}
