"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Badge } from "./badge";
import { ProductImage } from "@/lib/seo/image";
import type { ReactNode } from "react";

interface ProductCardProps {
  title: string;
  price: number;
  currency?: string;
  image?: string;
  href: string;
  badge?: string;
  badgeVariant?: "default" | "gold" | "outline";
  comparePrice?: number;
  inStock?: boolean;
  lowStock?: boolean;
  rating?: number;
  reviewCount?: number;
  className?: string;
  children?: ReactNode;
}

export function ProductCard({
  title,
  price,
  currency = "AED",
  image,
  href,
  badge,
  badgeVariant = "default",
  comparePrice,
  inStock = true,
  lowStock,
  rating,
  reviewCount,
  className,
  children,
}: ProductCardProps) {
  const discount = comparePrice && comparePrice > price
    ? Math.round((1 - price / comparePrice) * 100)
    : null;

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500",
        "hover:border-primary/20 hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)] hover:-translate-y-1.5",
        className,
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {image ? (
          <ProductImage
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-all duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/20 font-heading text-6xl tracking-widest">
            ◈
          </div>
        )}

        <div className="absolute inset-0 bg-dark/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 flex items-center justify-center">
          <span className="text-foreground/80 text-xs tracking-widest uppercase font-heading font-medium translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            Quick View
          </span>
        </div>

        {badge && (
          <div className="absolute top-3 left-3 z-20">
            <Badge variant={badgeVariant} dot>
              {badge}
            </Badge>
          </div>
        )}

        {discount && (
          <div className="absolute top-3 right-3 z-20">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-destructive/90 text-destructive-foreground text-[0.625rem] font-heading font-bold tracking-wider">
              -{discount}%
            </span>
          </div>
        )}

        {!inStock && (
          <div className="absolute inset-0 bg-dark/80 z-10 flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-full border border-border/30 text-foreground/60 text-[0.625rem] tracking-widest uppercase font-heading font-medium">
              Out of Stock
            </span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <span className="text-[0.5625rem] tracking-[0.15em] uppercase text-muted-foreground/50 font-medium">
            {currency}
          </span>
          {inStock && (
            <span className="flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-block h-1.5 w-1.5 rounded-full",
                  lowStock ? "bg-warning animate-pulse" : "bg-success",
                )}
              />
              <span className="text-[0.5625rem] tracking-wider text-muted-foreground/50 uppercase">
                {lowStock ? "Low Stock" : "In Stock"}
              </span>
            </span>
          )}
        </div>

        <h3 className="font-heading font-medium text-sm leading-snug text-foreground/90 group-hover:text-primary transition-colors duration-300 line-clamp-2">
          {title}
        </h3>

        <div className="flex items-baseline gap-2 mt-auto pt-1.5">
          <span className="font-heading text-lg font-bold text-foreground tracking-tight">
            {new Intl.NumberFormat("en-AE", {
              style: "currency",
              currency,
              minimumFractionDigits: 0,
            }).format(price)}
          </span>
          {comparePrice && comparePrice > price && (
            <span className="font-heading text-sm text-muted-2 line-through font-medium">
              {new Intl.NumberFormat("en-AE", {
                style: "currency",
                currency,
                minimumFractionDigits: 0,
              }).format(comparePrice)}
            </span>
          )}
        </div>

        {(rating !== undefined || reviewCount !== undefined) && (
          <div className="flex items-center gap-1.5 mt-0.5">
            {rating !== undefined && (
              <span className="text-[0.5625rem] text-gold tracking-wider">
                ★ {rating.toFixed(1)}
              </span>
            )}
            {reviewCount !== undefined && (
              <span className="text-[0.5625rem] text-muted-foreground/50">
                ({reviewCount})
              </span>
            )}
          </div>
        )}

        {children}
      </div>
    </Link>
  );
}
