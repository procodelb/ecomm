"use client";

import Link from "next/link";
import type { SuggestedProduct } from "@/lib/ai/types";

type Props = {
  products: SuggestedProduct[];
  locale: string;
};

export function ProductSuggestions({ products, locale }: Props) {
  const isAr = locale === "ar-AE";

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-white/50">{isAr ? "منتجات مقترحة:" : "Suggested products:"}</p>
      <div className="grid gap-2">
        {products.map((product) => {
          const price = locale.includes("AU") ? product.priceAud : product.priceAed;
          const symbol = locale.includes("AU") ? "A$" : "AED ";
          return (
            <Link
              key={product.id}
              href={`/${locale}/products/${product.slug}`}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.06]"
            >
              {product.image ? (
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white/5">
                  <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs text-white/20">◈</div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white/80">{product.title}</p>
                <p className="text-xs text-[#00C2FF]">{symbol}{price.toLocaleString()}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
