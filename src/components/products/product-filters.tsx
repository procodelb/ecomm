"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui";
import { X, SlidersHorizontal, RotateCcw } from "lucide-react";

interface CategoryOption {
  slug: string;
  title: string;
  count: number;
}

interface ProductFiltersProps {
  categories: CategoryOption[];
  selectedCategory: string | null;
  onCategoryChange: (slug: string | null) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  inStockOnly: boolean;
  onInStockChange: (v: boolean) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  totalResults: number;
  className?: string;
}

export function ProductFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  inStockOnly,
  onInStockChange,
  onClear,
  hasActiveFilters,
  totalResults,
  className,
}: ProductFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [minVal, maxVal] = priceRange;
  const [localMin, setLocalMin] = useState(String(minVal));
  const [localMax, setLocalMax] = useState(String(maxVal));

  const applyPrice = useCallback(() => {
    const mn = Number(localMin) || 0;
    const mx = Number(localMax) || 99999;
    onPriceRangeChange([Math.min(mn, mx), Math.max(mn, mx)]);
  }, [localMin, localMax, onPriceRangeChange]);

  const filterContent = (
    <div className="space-y-7">
      {/* Categories */}
      <div>
        <h4 className="text-[0.625rem] tracking-[0.15em] uppercase text-muted-foreground font-heading font-semibold mb-3">
          Category
        </h4>
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange(null)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all duration-300 text-left",
              !selectedCategory
                ? "bg-primary-10 text-primary border border-primary/20"
                : "text-muted-foreground/70 hover:text-foreground hover:bg-white/[0.02] border border-transparent",
            )}
          >
            <span>All Products</span>
            <span className="text-[0.625rem] text-muted-foreground/50 font-mono">
              {totalResults}
            </span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => onCategoryChange(cat.slug)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all duration-300 text-left",
                selectedCategory === cat.slug
                  ? "bg-primary-10 text-primary border border-primary/20"
                  : "text-muted-foreground/70 hover:text-foreground hover:bg-white/[0.02] border border-transparent",
              )}
            >
              <span>{cat.title}</span>
              <span className="text-[0.625rem] text-muted-foreground/50 font-mono">
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-[0.625rem] tracking-[0.15em] uppercase text-muted-foreground font-heading font-semibold mb-3">
          Price Range
        </h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            onBlur={applyPrice}
            className="h-9 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-muted-foreground/30 text-xs">—</span>
          <Input
            type="number"
            placeholder="Max"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            onBlur={applyPrice}
            className="h-9 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>

      {/* Availability */}
      <div>
        <h4 className="text-[0.625rem] tracking-[0.15em] uppercase text-muted-foreground font-heading font-semibold mb-3">
          Availability
        </h4>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            className={cn(
              "relative w-10 h-6 rounded-full transition-colors duration-300",
              inStockOnly ? "bg-primary/30" : "bg-white/[0.06]",
            )}
          >
            <div
              className={cn(
                "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-sm",
                inStockOnly && "translate-x-4 bg-primary",
              )}
            />
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => onInStockChange(e.target.checked)}
              className="sr-only"
            />
          </div>
          <span className="text-sm text-muted-foreground/70 group-hover:text-foreground transition-colors duration-300">
            In Stock Only
          </span>
        </label>
      </div>

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all duration-300"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className={cn(
          "lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all duration-300",
          hasActiveFilters && "border-primary/30 text-primary",
          className,
        )}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {hasActiveFilters && (
          <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
        )}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-full max-w-[260px] shrink-0">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-heading font-semibold tracking-tight">
              Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={onClear}
                className="text-[0.5625rem] tracking-wider uppercase text-primary hover:text-primary/80 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
          {filterContent}
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-[300px] max-w-[85vw] bg-card border-l border-border overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-card border-b border-border z-10 flex items-center justify-between px-5 py-4">
              <h3 className="text-sm font-heading font-semibold">Filters</h3>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-5">{filterContent}</div>
          </div>
        </div>
      )}
    </>
  );
}
