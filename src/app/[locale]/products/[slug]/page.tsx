import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getProductPageData, type ProductPageData } from "@/lib/api/product-page";
import { sanityFetch } from "@/lib/sanity/fetch";
import { getLocaleConfig } from "@/lib/locale/config";
import { SectionWrapper, Container } from "@/components/shared/section-wrapper";
import { ProductBreadcrumbs } from "@/components/products/product-breadcrumbs";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductInfo } from "@/components/products/product-info";
import { ProductDetails } from "@/components/products/product-details";
import { ProductFaq } from "@/components/products/product-faq";
import { ProductReviews } from "@/components/products/product-reviews";
import { RelatedProducts } from "@/components/products/related-products";
import { JsonLd } from "@/lib/seo/json-ld";
import { productSchema, breadcrumbSchema } from "@/lib/seo/schemas";
import { getOgImageUrl } from "@/lib/seo/og-image";
import { seoMetadata } from "@/lib/seo/metadata";
import { getLocalizedUrl } from "@/lib/seo/site-config";
import { ProductViewTracker } from "@/components/analytics/product-view-tracker";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductPageData(slug, locale);

  if (!product) return { title: "Product Not Found" };

  const seo = product.seo ?? {};
  const price = locale.includes("AU") ? product.priceAud : product.priceAed;
  const currency = getLocaleConfig(locale).currency;

  return seoMetadata({
    title: (seo.metaTitle as string) || product.title,
    description: (seo.metaDescription as string) || product.shortDescription || "",
    keywords: (seo.keywords as string[]) || product.tags || [],
    ogTitle: (seo.ogTitle as string) || product.title,
    ogDescription: (seo.ogDescription as string) || product.shortDescription || "",
    ogImage: (seo.ogImage as string) || product.images?.[0]?.url || getOgImageUrl(product.images),
    canonicalUrl: (seo.canonicalUrl as string) || undefined,
    noIndex: (seo.noIndex as boolean) || false,
    locale,
    path: `/products/${slug}`,
    type: "product",
  });
}

export async function generateStaticParams() {
  const products = await sanityFetch<Array<{ slug: string }>>({
    query: `*[_type == "product" && defined(slug.current)] { "slug": slug.current }`,
    tags: ["product-slugs"],
  });

  if (!products) return [];
  const locales = ["en-AE", "en-AU", "ar-AE"];
  return products.flatMap((p) => locales.map((locale) => ({ locale, slug: p.slug })));
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const product = await getProductPageData(slug, locale);

  if (!product) notFound();

  const config = getLocaleConfig(locale);
  const price = locale.includes("AU") ? product.priceAud : product.priceAed;
  const currency = config.currency;
  const categoryName = product.category?.title?.[locale.startsWith("ar") ? "ar" : "en"] ?? product.category?.slug ?? "Products";
  const productUrl = getLocalizedUrl(locale, `/products/${slug}`);

  const productSchemaData = productSchema({
    name: product.title,
    description: product.shortDescription || undefined,
    sku: product.sku,
    mpn: product.barcode || product.sku,
    image: product.images.map((i: { url: string }) => i.url).filter(Boolean),
    brand: product.supplier?.name || undefined,
    offers: {
      price: Number(price),
      currency,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: productUrl,
    },
    ...(product.averageRating > 0 && {
      aggregateRating: {
        ratingValue: product.averageRating,
        reviewCount: product.reviewCount,
      },
    }),
    ...(product.reviews.length > 0 && {
      reviews: product.reviews.slice(0, 5).map((r) => ({
        author: r.customerName || "Anonymous",
        datePublished: r.createdAt,
        reviewBody: r.body || undefined,
        reviewRating: { ratingValue: r.rating },
      })),
    }),
  });

  const breadcrumbData = breadcrumbSchema([
    { name: "Home", url: getLocalizedUrl(locale, "/") },
    { name: categoryName, url: getLocalizedUrl(locale, `/category/${product.category?.slug ?? ""}`) },
    { name: product.title, url: productUrl },
  ]);

  return (
    <>
      <ProductViewTracker productId={product.id} name={product.title} price={Number(price)} currency={currency} category={categoryName} />
      <JsonLd data={productSchemaData} id="product-schema" />
      <JsonLd data={breadcrumbData} id="breadcrumb-schema" />

      <SectionWrapper>
        <Container>
          <ProductBreadcrumbs
            items={[
              { label: categoryName, href: `/${locale}/category/${product.category?.slug ?? ""}` },
              { label: product.title },
            ]}
            className="mb-8"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ProductGallery images={product.images} videos={product.videos} models3d={product.models3d} title={product.title} />
            </div>
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ProductInfo product={product} />
            </div>
          </div>
        </Container>
      </SectionWrapper>

      <SectionWrapper dark>
        <Container>
          <ProductDetails product={product} />
        </Container>
      </SectionWrapper>

      <SectionWrapper>
        <Container>
          <ProductFaq items={[]} />
        </Container>
      </SectionWrapper>

      {product.reviews.length > 0 && (
        <SectionWrapper dark>
          <Container>
            <ProductReviews reviews={product.reviews} averageRating={product.averageRating} reviewCount={product.reviewCount} locale={locale} />
          </Container>
        </SectionWrapper>
      )}

      {product.relatedProducts.length > 0 && (
        <SectionWrapper gold>
          <Container>
            <RelatedProducts products={product.relatedProducts} locale={locale} currency={currency} />
          </Container>
        </SectionWrapper>
      )}
    </>
  );
}
