const REQUIRED_PROD_ENV_VARS = [
  "DATABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "CRON_SECRET",
] as const;

const STRIPE_PROD_ENV_VARS = [
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
] as const;

const PLACEHOLDER_VALUES = [
  "placeholder",
  "your_",
  "sk_test_placeholder",
  "pk_test_placeholder",
  "whsec_placeholder",
  "change-me",
  "xxxxx",
];

type EnvCheckResult = {
  valid: boolean;
  missing: string[];
  placeholders: string[];
  warnings: string[];
};

export function validateProductionEnv(): EnvCheckResult {
  const result: EnvCheckResult = {
    valid: true,
    missing: [],
    placeholders: [],
    warnings: [],
  };

  const isProd = process.env.NODE_ENV === "production";

  for (const key of REQUIRED_PROD_ENV_VARS) {
    const value = process.env[key];
    if (!value) {
      result.missing.push(key);
      result.valid = false;
      continue;
    }

    const isPlaceholder = PLACEHOLDER_VALUES.some((p) => value.toLowerCase().includes(p));
    if (isPlaceholder) {
      result.placeholders.push(key);
      if (isProd) {
        result.valid = false;
      }
    }
  }

  // Only require Stripe env vars when Stripe is the active payment provider
  const provider = (process.env.PAYMENT_PROVIDER ?? "cash_on_delivery").trim().toLowerCase();
  if (provider === "stripe") {
    for (const key of STRIPE_PROD_ENV_VARS) {
      const value = process.env[key];
      if (!value) {
        result.missing.push(key);
        result.valid = false;
        continue;
      }

      const isPlaceholder = PLACEHOLDER_VALUES.some((p) => value.toLowerCase().includes(p));
      if (isPlaceholder) {
        result.placeholders.push(key);
        if (isProd) {
          result.valid = false;
        }
      }
    }
  }

  if (isProd) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    if (!supabaseUrl.startsWith("https://")) {
      result.warnings.push("Supabase URL should use HTTPS");
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
    if (!siteUrl.startsWith("https://")) {
      result.warnings.push("Site URL should use HTTPS in production");
    }

    if (result.placeholders.length > 0) {
      result.warnings.push(`Placeholder values detected for: ${result.placeholders.join(", ")}. Update with real credentials before going live.`);
    }
  }

  return result;
}

const SECRET_PATTERNS = [
  /sk_live_/,
  /pk_live_/,
  /whsec_/,
  /ghp_/,
  /gho_/,
  /xox[bpsa]-/,
  /SUPABASE_SERVICE_ROLE_KEY/,
  /-----BEGIN (RSA |EC )?PRIVATE KEY-----/,
];

export function checkForSecretsInCode(content: string, filename: string): string[] {
  const warnings: string[] = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("//") || trimmed.startsWith("#") || trimmed.startsWith("/*")) {
      continue;
    }

    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(trimmed)) {
        warnings.push(`${filename}:${i + 1} — Possible secret exposed`);
        break;
      }
    }
  }

  return warnings;
}
