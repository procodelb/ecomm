"use client";

import { cn } from "@/lib/utils/cn";
import { SearchX, RotateCcw } from "lucide-react";

interface ProductsEmptyStateProps {
  title?: string;
  description?: string;
  onClear?: () => void;
  className?: string;
}

export function ProductsEmptyState({
  title = "No Products Found",
  description = "Try adjusting your filters or search criteria to find what you're looking for.",
  onClear,
  className,
}: ProductsEmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 px-6 text-center", className)}>
      <div className="w-16 h-16 rounded-2xl bg-primary-10 border border-primary/20 flex items-center justify-center mb-5">
        <SearchX className="h-7 w-7 text-primary/60" />
      </div>
      <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground/70 max-w-sm leading-relaxed mb-7">
        {description}
      </p>
      {onClear && (
        <button
          onClick={onClear}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all duration-300"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Clear Filters
        </button>
      )}
    </div>
  );
}
