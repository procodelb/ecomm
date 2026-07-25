import { sanityFetch } from "@/lib/sanity/fetch";
import { productsQuery } from "@/sanity/queries/products";
import { ProductsLayout } from "@/components/products/products-layout";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { seoMetadata } from "@/lib/seo/metadata";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return seoMetadata({
    title: "Premium Collection",
    description: "Explore our handpicked selection of luxury water toys and premium watercraft for the discerning enthusiast.",
    locale,
    path: "/products",
  });
}

const localeCurrencies: Record<string, string> = {
  "en-AE": "AED",
  "en-AU": "AUD",
  "ar-AE": "AED",
};

export default async function ProductsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const currency = localeCurrencies[locale] || "AED";

  const products = await sanityFetch<any[]>({
    query: productsQuery,
    tags: ["products"],
  });

  return (
    <ProductsLayout
      products={products ?? []}
      locale={locale}
      currency={currency}
    />
  );
}
