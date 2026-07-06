import type { Metadata } from "next";
import { getSiteUrl, SITE_NAME, SITE_DESCRIPTION, DEFAULT_OG_IMAGE, getLocalizedUrl, getLocaleAlternateUrls } from "./site-config";

type SeoInput = {
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  locale: string;
  path: string;
  publishedTime?: string;
  modifiedTime?: string;
  type?: "website" | "article" | "product";
};

export function seoMetadata(input: SeoInput): Metadata {
  const { title, description, keywords, ogTitle, ogDescription, ogImage, canonicalUrl, noIndex, locale, path, publishedTime, modifiedTime, type = "website" } = input;

  const resolvedTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const resolvedDescription = description || SITE_DESCRIPTION;
  const resolvedOgImage = ogImage || DEFAULT_OG_IMAGE;
  const resolvedCanonical = canonicalUrl || getLocalizedUrl(locale, path);
  const alternates = getLocaleAlternateUrls(path);
  const localeUnderscored = locale.replace("-", "_");

  const metadata: Metadata = {
    title: resolvedTitle,
    description: resolvedDescription,
    keywords: keywords?.join(", "),
    alternates: {
      canonical: resolvedCanonical,
      languages: alternates,
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: ogTitle || resolvedTitle,
      description: ogDescription || resolvedDescription,
      url: resolvedCanonical,
      siteName: SITE_NAME,
      images: [{ url: resolvedOgImage, width: 1200, height: 630, alt: resolvedTitle }],
      locale: localeUnderscored,
      type: type === "article" ? "article" : "website",
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle || resolvedTitle,
      description: ogDescription || resolvedDescription,
      images: [resolvedOgImage],
    },
    other: {},
  };

  if (keywords && keywords.length > 0) {
    metadata.other = { ...metadata.other, "news_keywords": keywords.slice(0, 10).join(",") };
  }

  return metadata;
}

export function noindexMetadata(): Metadata {
  return { robots: { index: false, follow: false } };
}
