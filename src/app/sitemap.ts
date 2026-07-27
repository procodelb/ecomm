import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/seo/site-config";
import { localeConfigs, type LocaleKey } from "@/config";

type SitemapEntry = {
  url: string;
  lastModified?: Date | string;
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
  alternates?: Record<string, string>;
};

const locales = Object.keys(localeConfigs) as LocaleKey[];

function localizedUrls(path: string): SitemapEntry[] {
  return locales.map((locale) => ({
    url: locale === "en-AE" ? `${getSiteUrl()}${path}` : `${getSiteUrl()}/${locale}${path}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    alternates: Object.fromEntries(
      locales.map((l) => [l === "en-AE" ? "x-default" : l.replace("-", "-"), l === "en-AE" ? `${getSiteUrl()}${path}` : `${getSiteUrl()}/${l}${path}`]),
    ),
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: SitemapEntry[] = [];

  for (const locale of locales) {
    entries.push({
      url: locale === "en-AE" ? getSiteUrl() : `${getSiteUrl()}/${locale}`,
      changeFrequency: "weekly",
      priority: 1.0,
    });
  }

  const staticPages = ["/checkout", "/login", "/register", "/order/confirmation"];
  for (const page of staticPages) {
    entries.push(...localizedUrls(page));
  }

  try {
    const products = await prisma.product.findMany({
      where: { status: { in: ["active", "out_of_stock"] } },
      select: { slug: true, updatedAt: true },
    });

    for (const product of products) {
      for (const locale of locales) {
        entries.push({
          url: locale === "en-AE" ? `${getSiteUrl()}/products/${product.slug}` : `${getSiteUrl()}/${locale}/products/${product.slug}`,
          lastModified: product.updatedAt,
          changeFrequency: "weekly",
          priority: 0.9,
        });
      }
    }
  } catch {
    // DB unavailable
  }

  const accountPages = ["/account", "/account/orders", "/account/addresses", "/account/wishlist", "/account/reviews", "/account/returns", "/account/support", "/account/tracking", "/account/settings"];
  for (const page of accountPages) {
    entries.push(...localizedUrls(page));
  }

  return entries.map((e) => ({
    url: e.url,
    lastModified: e.lastModified,
    changeFrequency: e.changeFrequency,
    priority: e.priority,
    alternates: e.alternates,
  }));
}
