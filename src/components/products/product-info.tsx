"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/typography";
import { useCart } from "@/providers/cart";
import { getLocaleConfig } from "@/lib/locale/config";
import {
  ShoppingCart,
  Check,
  Clock,
  Truck,
  Shield,
  RotateCcw,
  Star,
  CircleCheck,
  Zap,
} from "lucide-react";
import type { ProductPageData } from "@/lib/api/product-page";

interface ProductInfoProps {
  product: ProductPageData;
  className?: string;
}

function formatPrice(amount: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale.replace("-", "-"), {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function ProductInfo({ product, className }: ProductInfoProps) {
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);

  const currency = product.currency;
  const locale = product.locale;
  const config = getLocaleConfig(locale);

  const selectedVariant = useMemo(() => {
    if (!selectedVariantId) return null;
    return product.variants.find((v) => v.id === selectedVariantId) ?? null;
  }, [selectedVariantId, product.variants]);

  const currentPrice = selectedVariant
    ? (locale.includes("AU") ? selectedVariant.priceAud : selectedVariant.priceAed)
    : (locale.includes("AU") ? product.priceAud : product.priceAed);

  const currentComparePrice = selectedVariant
    ? null
    : (locale.includes("AU") ? product.comparePriceAud : product.comparePriceAed);

  const currentImage = selectedVariant?.attributes?.["color"]
    ? product.images.find((img) => img.alt?.toLowerCase().includes(selectedVariant.attributes["color"].toLowerCase()))?.url
    : null;

  const inStock = selectedVariant ? selectedVariant.stock > 0 : product.inStock;
  const stockQuantity = selectedVariant ? selectedVariant.stock : product.availableQuantity;

  const hasDiscount = currentComparePrice && currentComparePrice > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
    : 0;

  const attributeGroups = useMemo(() => {
    const groups: Record<string, string[]> = {};
    for (const v of product.variants) {
      for (const [key, val] of Object.entries(v.attributes)) {
        if (!groups[key]) groups[key] = [];
        if (!groups[key].includes(val)) groups[key].push(val);
      }
    }
    return groups;
  }, [product.variants]);

  function handleAddToCart() {
    addItem({
      id: selectedVariantId ?? product.id,
      productId: product.id,
      variantId: selectedVariantId,
      sku: selectedVariant?.sku ?? null,
      title: selectedVariant?.title ?? product.title,
      variantTitle: selectedVariant?.title ?? null,
      attributes: selectedVariant?.attributes ?? {},
      price: currentPrice,
      quantity: 1,
      image: currentImage ?? product.images[0]?.url ?? null,
      locale,
      currency: config.currency,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  return (
    <div className={cn("space-y-7", className)}>
      {/* Category & Title */}
      <div className="space-y-2.5">
        {product.category && (
          <span className="text-[0.5625rem] tracking-[0.2em] uppercase text-primary/70 font-heading font-medium">
            {product.category.title?.[locale.startsWith("ar") ? "ar" : "en"] ?? product.category.slug}
          </span>
        )}
        <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
          {product.title}
        </h1>
        {product.shortDescription && (
          <Text size="sm" muted className="max-w-xl leading-relaxed">
            {product.shortDescription}
          </Text>
        )}
      </div>

      {/* Rating */}
      {product.reviewCount > 0 && (
        <div className="flex items-center gap-2.5">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "h-3.5 w-3.5",
                  star <= Math.round(product.averageRating)
                    ? "text-gold fill-gold"
                    : "text-muted-foreground/20",
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            <span className="text-foreground font-medium">{product.averageRating.toFixed(1)}</span>
            {" / "}
            <span className="hover:text-primary transition-colors cursor-pointer">
              {product.reviewCount} review{product.reviewCount !== 1 ? "s" : ""}
            </span>
          </span>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Pricing */}
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
          {formatPrice(currentPrice, currency, locale)}
        </span>
        {hasDiscount && (
          <>
            <span className="font-heading text-lg text-muted-2 line-through">
              {formatPrice(currentComparePrice, currency, locale)}
            </span>
            <Badge variant="gold" dot>
              Save {discountPercent}%
            </Badge>
          </>
        )}
        {product.featured && !hasDiscount && (
          <Badge variant="gold">Premium Pick</Badge>
        )}
      </div>

      {/* Payment hint */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
        <Zap className="h-3 w-3" />
        <span>
          or 4 interest-free payments of{" "}
          <strong className="text-foreground/80">
            {formatPrice(currentPrice / 4, currency, locale)}
          </strong>{" "}
          with <span className="text-primary">Tabby</span>
        </span>
      </div>

      {/* Variant Selector */}
      {product.variants.length > 1 && (
        <div className="space-y-5">
          {Object.entries(attributeGroups).map(([attrName, values]) => {
            const isColor = attrName === "color" || attrName === "colour";
            return (
              <div key={attrName}>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
                    {attrName}
                  </span>
                  <span className="text-xs text-primary font-medium">
                    {selectedVariant?.attributes?.[attrName] ?? "Select"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {values.map((val) => {
                    const variantForValue = product.variants.find(
                      (v) => v.attributes[attrName] === val,
                    );
                    const isSelected = selectedVariant?.attributes?.[attrName] === val;

                    return (
                      <button
                        key={val}
                        onClick={() => {
                          if (variantForValue) setSelectedVariantId(variantForValue.id);
                          else {
                            const v = product.variants.find(
                              (pv) => pv.attributes[attrName] === val,
                            );
                            if (v) setSelectedVariantId(v.id);
                          }
                        }}
                        className={cn(
                          "relative px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300",
                          isSelected
                            ? "border-primary bg-primary-10 text-primary ring-1 ring-primary/30 shadow-[0_0_12px_rgba(0,212,255,0.06)]"
                            : "border-border bg-card hover:border-primary/40 text-foreground/80",
                          isColor && "px-3 py-3",
                        )}
                      >
                        {isColor ? (
                          <span
                            className="block w-6 h-6 rounded-full ring-1 ring-white/10"
                            style={{ backgroundColor: val.toLowerCase() }}
                          />
                        ) : (
                          val
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stock Status */}
      <div className={cn(
        "flex items-center gap-2.5 px-4 py-3 rounded-xl border",
        inStock
          ? stockQuantity <= 5 && stockQuantity > 0
            ? "border-warning/20 bg-warning/5"
            : "border-success/20 bg-success/5"
          : "border-destructive/20 bg-destructive/5",
      )}>
        {inStock ? (
          <>
            <CircleCheck className={cn(
              "h-4 w-4 shrink-0",
              stockQuantity <= 5 && stockQuantity > 0 ? "text-warning" : "text-success",
            )} />
            <div className="flex-1 min-w-0">
              <span className={cn(
                "text-sm font-medium",
                stockQuantity <= 5 && stockQuantity > 0 ? "text-warning" : "text-success",
              )}>
                {stockQuantity <= 5 && stockQuantity > 0
                  ? `Only ${stockQuantity} left in stock`
                  : "In Stock"}
              </span>
              {product.leadTime && (
                <span className="text-xs text-muted-foreground/60 ml-2">
                  — {product.leadTime}
                </span>
              )}
            </div>
          </>
        ) : (
          <>
            <Clock className="h-4 w-4 text-destructive shrink-0" />
            <span className="text-sm text-destructive font-medium">Out of Stock</span>
          </>
        )}
        {product.sku && (
          <span className="text-[0.5625rem] text-muted-foreground/40 font-mono shrink-0">
            SKU: {product.sku}
          </span>
        )}
      </div>

      {/* Add to Cart */}
      <Button
        size="xl"
        className="w-full h-14 text-base gap-3 font-heading font-semibold tracking-wide"
        onClick={handleAddToCart}
        disabled={!inStock}
      >
        {addedToCart ? (
          <span className="flex items-center gap-2.5">
            <Check className="h-5 w-5" /> Added to Cart
          </span>
        ) : (
          <span className="flex items-center gap-2.5">
            <ShoppingCart className="h-5 w-5" /> Add to Cart
          </span>
        )}
      </Button>

      {/* Trust indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-card border border-border hover:border-primary/15 transition-all duration-300">
          <div className="w-9 h-9 rounded-lg bg-primary-10 border border-primary/20 flex items-center justify-center shrink-0">
            <Truck className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-medium text-foreground block leading-tight">Free White-Glove Delivery</span>
            <span className="text-[0.625rem] text-muted-foreground/60">{product.leadTime ?? "1–3 business days"}</span>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-card border border-border hover:border-primary/15 transition-all duration-300">
          <div className="w-9 h-9 rounded-lg bg-gold-10 border border-gold/20 flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4 text-gold" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-medium text-foreground block leading-tight">Extended Warranty</span>
            <span className="text-[0.625rem] text-muted-foreground/60">Up to 5 years coverage</span>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-card border border-border hover:border-primary/15 transition-all duration-300">
          <div className="w-9 h-9 rounded-lg bg-primary-10 border border-primary/20 flex items-center justify-center shrink-0">
            <RotateCcw className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-medium text-foreground block leading-tight">30-Day Satisfaction Guarantee</span>
            <span className="text-[0.625rem] text-muted-foreground/60">No questions asked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
