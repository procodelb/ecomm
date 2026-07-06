import { localeConfigs } from "@/config";
import type { LocaleKey } from "@/config";

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://ecomm-store.com").replace(/\/+$/, "");
}

export const SITE_NAME = "ECOMM";
export const SITE_DESCRIPTION = "Curating the finest luxury products for discerning customers across the UAE, Dubai, and Australia.";
export const SITE_LOGO = `${getSiteUrl()}/images/logo.png`;
export const DEFAULT_OG_IMAGE = `${getSiteUrl()}/images/og-default.jpg`;

export function getLocaleAlternates(path: string, excludeLocale?: string) {
  const locales = Object.keys(localeConfigs) as LocaleKey[];
  const alternates: Record<string, string> = {};
  for (const locale of locales) {
    if (locale === excludeLocale) continue;
    alternates[locale === "en-AE" ? "x-default" : locale.replace("-", "-")] =
      `${getSiteUrl()}${locale === "en-AE" ? path : `/${locale}${path}`}`;
  }
  return alternates;
}

export function getLocalizedUrl(locale: string, path: string): string {
  const base = getSiteUrl();
  if (locale === "en-AE") return `${base}${path}`;
  return `${base}/${locale}${path}`;
}

export function getLocaleAlternateUrls(path: string): Record<string, string> {
  const locales = Object.keys(localeConfigs) as LocaleKey[];
  const result: Record<string, string> = {};
  for (const locale of locales) {
    const href = getLocalizedUrl(locale, path);
    const key = locale === "en-AE" ? "x-default" : locale.replace("-", "-");
    result[key] = href;
  }
  return result;
}
