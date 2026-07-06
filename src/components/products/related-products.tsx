"use client";

import { cn } from "@/lib/utils/cn";
import { Heading, Text } from "@/components/ui/typography";
import { ProductCard } from "@/components/ui/product-card";
import { ProductGrid } from "./product-grid";

interface RelatedProductItem {
  _id: string;
  slug: string;
  title: Record<string, string>;
  price: { aed: number; aud: number };
  images: { url: string; alt: string | null }[];
  availability: { status: string } | null;
}

interface RelatedProductsProps {
  products: RelatedProductItem[];
  locale: string;
  currency: string;
  className?: string;
}

export function RelatedProducts({
  products,
  locale,
  currency,
  className,
}: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <div className={cn("space-y-10", className)}>
      <div className="text-center space-y-2">
        <Heading as="h3" gradient="gold">
          You May Also Like
        </Heading>
        <Text muted>Discover more premium water toys</Text>
      </div>

      <ProductGrid>
        {products.map((p) => {
          const localizedTitle =
            p.title?.[locale.startsWith("ar") ? "ar" : "en"] ??
            p.title?.en ??
            "";
          const price = locale.includes("AU") ? p.price?.aud : p.price?.aed;
          const image = p.images?.[0]?.url;
          const badge =
            p.availability?.status === "out_of_stock"
              ? "Out of Stock"
              : p.availability?.status === "coming_soon"
                ? "Coming Soon"
                : undefined;

          return (
            <ProductCard
              key={p._id}
              title={localizedTitle}
              price={price ?? 0}
              currency={currency}
              image={image}
              href={`/products/${p.slug}`}
              badge={badge}
              badgeVariant={badge ? "outline" : undefined}
            />
          );
        })}
      </ProductGrid>
    </div>
  );
}
