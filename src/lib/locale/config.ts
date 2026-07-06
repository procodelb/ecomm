import { localeConfigs, type LocaleKey } from "@/config";

export function getLocaleConfig(locale: string) {
  return localeConfigs[locale as LocaleKey] ?? localeConfigs["en-AE"];
}

export function formatPrice(amount: number, locale: string): string {
  const config = getLocaleConfig(locale);
  return new Intl.NumberFormat(config.localeCode, {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date, locale: string): string {
  const config = getLocaleConfig(locale);
  return new Intl.DateTimeFormat(config.localeCode, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}
