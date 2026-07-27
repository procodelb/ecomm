import "server-only";

import { unstable_rethrow } from "next/navigation";
import { sanityFetch } from "@/lib/sanity/fetch";
import { productBySlugQuery, relatedProductsQuery } from "@/sanity/queries/products";
import { prisma } from "@/lib/prisma";
import { getLocaleConfig } from "@/lib/locale/config";

export interface ProductPageImage {
  url: string;
  alt: string | null;
  caption?: string | null;
}

export interface ProductPageVideo {
  url: string;
  platform: string | null;
  thumbnail: string | null;
  title: string | null;
}

export interface ProductPageModel3d {
  url: string;
  format: string | null;
  thumbnail: string | null;
  fileSize: number | null;
  autoRotate: boolean | null;
  arEnabled: boolean | null;
}

export interface ProductPageCertification {
  name: string;
  customName?: string;
  certificateUrl?: string;
  issuingBody?: string;
}

export interface ProductPageVariant {
  id: string;
  title: string;
  sku: string;
  attributes: Record<string, string>;
  priceAed: number;
  priceAud: number;
  stock: number;
  isActive: boolean;
}

export interface ProductPageReview {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  customerName: string | null;
  customerEmail: string | null;
  createdAt: string;
  pros: string[];
  cons: string[];
  images: string[];
  verifiedPurchase: boolean;
}

export interface ProductPageData {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  description: unknown[] | null;
  sku: string;
  barcode: string | null;
  supplier: { _id: string; name: string; code: string } | null;
  category: { _id: string; slug: string; title: Record<string, string> } | null;
  tags: string[];
  featured: boolean;
  hasVariants: boolean;
  schemaProductType: string | null;
  availability: { status: string; stockCount?: number; leadTime?: string } | null;
  certifications: ProductPageCertification[];
  weightKg: number | null;
  dimensionsCm: { length?: number; width?: number; height?: number } | null;
  material: string | null;
  color: string | null;
  ageRating: string | null;
  warnings: string | null;
  countryOfOrigin: string | null;
  hsCode: string | null;
  msdsRequired: boolean | null;
  msdsUrl: string | null;
  images: ProductPageImage[];
  videos: ProductPageVideo[];
  models3d: ProductPageModel3d[];
  seo: Record<string, unknown> | null;

  // Pricing (from Prisma — falls back to Sanity pricing)
  priceAed: number;
  priceAud: number;
  comparePriceAed: number | null;
  comparePriceAud: number | null;

  // Inventory (from Prisma)
  inStock: boolean;
  stockQuantity: number;
  availableQuantity: number;
  leadTime: string | null;

  // Variants (merged from Sanity + Prisma)
  variants: ProductPageVariant[];

  // Reviews (from Prisma)
  reviews: ProductPageReview[];
  averageRating: number;
  reviewCount: number;

  // Related products (from Sanity)
  relatedProducts: Array<{
    _id: string;
    slug: string;
    title: Record<string, string>;
    price: { aed: number; aud: number };
    images: { url: string; alt: string | null }[];
    availability: { status: string } | null;
  }>;

  // Config
  locale: string;
  currency: string;
  currencySymbol: string;
}

function getLocalized(data: Record<string, string> | null | undefined, locale: string): string {
  if (!data) return "";
  const lang = locale.startsWith("ar") ? "ar" : "en";
  return data[lang] ?? data.en ?? data.ar ?? "";
}

function getLocalizedText(
  data: { en?: string | null; ar?: string | null } | null | undefined,
  locale: string,
): string | null {
  if (!data) return null;
  const lang = locale.startsWith("ar") ? "ar" : "en";
  return (data as Record<string, string | null>)[lang] ?? data.en ?? data.ar ?? null;
}

export async function getProductPageData(
  slug: string,
  locale: string,
): Promise<ProductPageData | null> {
  const config = getLocaleConfig(locale);

  // 1. Fetch Sanity product
  const sanityProduct = await sanityFetch<Record<string, unknown>>({
    query: productBySlugQuery,
    params: { slug },
    tags: [`product:${slug}`],
  });

  if (!sanityProduct) return null;

  const title = sanityProduct.title as Record<string, string>;
  const shortDescription = sanityProduct.shortDescription as Record<string, string> | null;
  const category = sanityProduct.category as Record<string, unknown> | null;
  const images = (sanityProduct.images as Array<Record<string, unknown>>) ?? [];
  const videos = (sanityProduct.videos as Array<Record<string, unknown>>) ?? [];
  const models3d = (sanityProduct.models3d as Array<Record<string, unknown>>) ?? [];
  const price = sanityProduct.price as { aed: number; aud: number };
  const comparePrice = sanityProduct.comparePrice as { aed?: number; aud?: number } | null;
  const availability = sanityProduct.availability as {
    status?: string;
    stockCount?: number;
    leadTime?: string;
  } | null;
  const certifications = (sanityProduct.certifications as Array<Record<string, unknown>>) ?? [];
  const dimensionsCm = sanityProduct.dimensionsCm as {
    length?: number;
    width?: number;
    height?: number;
  } | null;

  // 2. Fetch variants from Sanity
  const sanityVariants = (sanityProduct.variants as Array<Record<string, unknown>>) ?? [];

  // 3. Fetch Prisma data (optional)
  let prismaProduct: {
    priceAed: number;
    priceAud: number;
    comparePriceAed: number | null;
    comparePriceAud: number | null;
    stockQuantity: number;
    availableQuantity: number;
    inStock: boolean;
    leadTime: string | null;
    variants: ProductPageVariant[];
  } | null = null;

  try {
    const dbProduct = await prisma.product.findFirst({
      where: { slug, status: { in: ["active", "out_of_stock"] } },
      include: {
        variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
        inventory: { select: { quantity: true, reserved: true } },
      },
    });

    if (dbProduct) {
      const totalQuantity = dbProduct.inventory.reduce((sum, i) => sum + i.quantity, 0);
      const totalReserved = dbProduct.inventory.reduce((sum, i) => sum + i.reserved, 0);

      prismaProduct = {
        priceAed: Number(dbProduct.priceAed),
        priceAud: Number(dbProduct.priceAud),
        comparePriceAed: dbProduct.comparePriceAed ? Number(dbProduct.comparePriceAed) : null,
        comparePriceAud: dbProduct.comparePriceAud ? Number(dbProduct.comparePriceAud) : null,
        stockQuantity: totalQuantity,
        availableQuantity: totalQuantity - totalReserved,
        inStock: totalQuantity - totalReserved > 0,
        leadTime: dbProduct.leadTime,
        variants: dbProduct.variants.map((v) => ({
          id: v.id,
          title: v.title,
          sku: v.sku,
          attributes: v.attributes as Record<string, string>,
          priceAed: Number(v.priceAed),
          priceAud: Number(v.priceAud),
          stock: v.stock,
          isActive: v.isActive,
        })),
      };
    }
  } catch (e) {
    unstable_rethrow(e);
    console.warn(`[product-page] Prisma product query failed for slug=${slug}:`, e instanceof Error ? e.message : "unknown");
  }

  // 4. Fetch reviews from Prisma
  let reviews: ProductPageReview[] = [];
  try {
    const dbReviews = await prisma.review.findMany({
      where: {
        product: { slug },
        status: "approved",
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    reviews = dbReviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      customerName: r.customerName,
      customerEmail: r.customerEmail,
      createdAt: r.createdAt.toISOString(),
      pros: r.pros,
      cons: r.cons,
      images: typeof r.images === "string" ? [] : (r.images as string[]),
      verifiedPurchase: r.verifiedPurchase,
    }));
  } catch (e) {
    unstable_rethrow(e);
    console.warn(`[product-page] Prisma review query failed for slug=${slug}:`, e instanceof Error ? e.message : "unknown");
  }

  const averageRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

  // 5. Fetch related products from Sanity
  const categoryId = (sanityProduct.category as { _id?: string })?._id;
  const productId = sanityProduct._id as string;

  const sanityRelated = categoryId
    ? await sanityFetch<Array<Record<string, unknown>>>({
        query: relatedProductsQuery,
        params: { productId, categoryId },
        tags: [`product:related:${slug}`],
      })
    : [];

  const relatedProducts = (sanityRelated ?? []).map((p) => ({
    _id: p._id as string,
    slug: p.slug as string,
    title: p.title as Record<string, string>,
    price: p.price as { aed: number; aud: number },
    images: ((p.images as Array<Record<string, unknown>>) ?? []).map((img) => ({
      url: img.url as string,
      alt: (img.alt as string | null) ?? null,
    })),
    availability: (p.availability as { status: string } | null) ?? null,
  }));

  // 6. Merge pricing (Prisma takes priority)
  const finalPriceAed = prismaProduct?.priceAed ?? price?.aed ?? 0;
  const finalPriceAud = prismaProduct?.priceAud ?? price?.aud ?? 0;
  const finalComparePriceAed = prismaProduct?.comparePriceAed ?? comparePrice?.aed ?? null;
  const finalComparePriceAud = prismaProduct?.comparePriceAud ?? comparePrice?.aud ?? null;

  // 7. Merge variants
  const mergedVariants: ProductPageVariant[] = sanityVariants.map((sv) => {
    const svPrice = sv.price as { aed: number; aud: number } | undefined;
    const dbVariant = prismaProduct?.variants.find((v) => v.sku === (sv.sku as string));
    return {
      id: (sv._id as string) ?? dbVariant?.id ?? "",
      title: getLocalizedText(sv.title as Record<string, string>, locale) ?? (sv.title as string) ?? "",
      sku: (sv.sku as string) ?? "",
      attributes: (sv.attributes as Record<string, string>) ?? {},
      priceAed: dbVariant?.priceAed ?? svPrice?.aed ?? finalPriceAed,
      priceAud: dbVariant?.priceAud ?? svPrice?.aud ?? finalPriceAud,
      stock: dbVariant?.stock ?? availability?.stockCount ?? 0,
      isActive: (sv.isActive as boolean) ?? true,
    };
  });

  // 8. Build result
  return {
    id: sanityProduct._id as string,
    slug: sanityProduct.slug as string,
    title: getLocalized(title, locale),
    shortDescription: getLocalizedText(shortDescription, locale),
    description: sanityProduct.description as unknown[] | null,
    sku: (sanityProduct.sku as string) ?? "",
    barcode: (sanityProduct.barcode as string | null) ?? null,
    supplier: sanityProduct.supplier as { _id: string; name: string; code: string } | null,
    category: category
      ? {
          _id: category._id as string,
          slug: category.slug as string,
          title: category.title as Record<string, string>,
        }
      : null,
    tags: (sanityProduct.tags as string[]) ?? [],
    featured: (sanityProduct.featured as boolean) ?? false,
    hasVariants: (sanityProduct.hasVariants as boolean) ?? false,
    schemaProductType: (sanityProduct.schemaProductType as string | null) ?? null,
    availability: availability
      ? {
          status: availability.status ?? "in_stock",
          stockCount: availability.stockCount,
          leadTime: availability.leadTime,
        }
      : null,
    certifications: certifications.map((c: Record<string, unknown>) => ({
      name: c.name as string,
      customName: c.customName as string | undefined,
      certificateUrl: c.certificateUrl as string | undefined,
      issuingBody: c.issuingBody as string | undefined,
    })),
    weightKg: (sanityProduct.weightKg as number | null) ?? null,
    dimensionsCm,
    material: (sanityProduct.material as string | null) ?? null,
    color: (sanityProduct.color as string | null) ?? null,
    ageRating: (sanityProduct.ageRating as string | null) ?? null,
    warnings: (sanityProduct.warnings as string | null) ?? null,
    countryOfOrigin: (sanityProduct.countryOfOrigin as string | null) ?? null,
    hsCode: (sanityProduct.hsCode as string | null) ?? null,
    msdsRequired: (sanityProduct.msdsRequired as boolean | null) ?? null,
    msdsUrl: (sanityProduct.msdsUrl as string | null) ?? null,
    images: images.map((img: Record<string, unknown>) => ({
      url: img.url as string,
      alt: (img.alt as string | null) ?? null,
      caption: (img.caption as string | null) ?? null,
    })),
    videos: videos.map((v: Record<string, unknown>) => ({
      url: v.url as string,
      platform: (v.platform as string | null) ?? null,
      thumbnail: (v.thumbnail as string | null) ?? null,
      title: (v.title as string | null) ?? null,
    })),
    models3d: models3d.map((m: Record<string, unknown>) => ({
      url: m.url as string,
      format: (m.format as string | null) ?? null,
      thumbnail: (m.thumbnail as string | null) ?? null,
      fileSize: (m.fileSize as number | null) ?? null,
      autoRotate: (m.autoRotate as boolean | null) ?? null,
      arEnabled: (m.arEnabled as boolean | null) ?? null,
    })),
    seo: sanityProduct.seo as Record<string, unknown> | null,

    priceAed: finalPriceAed,
    priceAud: finalPriceAud,
    comparePriceAed: finalComparePriceAed,
    comparePriceAud: finalComparePriceAud,

    inStock: prismaProduct?.inStock ?? (availability?.status === "in_stock"),
    stockQuantity: prismaProduct?.stockQuantity ?? availability?.stockCount ?? 0,
    availableQuantity: prismaProduct?.availableQuantity ?? availability?.stockCount ?? 0,
    leadTime: prismaProduct?.leadTime ?? availability?.leadTime ?? null,

    variants: mergedVariants,

    reviews,
    averageRating,
    reviewCount: reviews.length,

    relatedProducts,

    locale,
    currency: config.currency,
    currencySymbol: config.currencySymbol,
  };
}
