"use client";

import { cn } from "@/lib/utils/cn";
import { ChevronDown } from "lucide-react";

export type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

const sortLabels: Record<SortOption, string> = {
  "newest": "Newest First",
  "price-asc": "Price: Low → High",
  "price-desc": "Price: High → Low",
  "name-asc": "Name: A → Z",
  "name-desc": "Name: Z → A",
};

interface ProductSortProps {
  value: SortOption;
  onChange: (v: SortOption) => void;
  totalResults: number;
  className?: string;
}

export function ProductSort({ value, onChange, totalResults, className }: ProductSortProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="text-sm text-muted-foreground/50 hidden sm:block">
        <span className="font-mono text-foreground/70">{totalResults}</span> results
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as SortOption)}
          className="appearance-none bg-card border border-border hover:border-primary/20 focus:border-primary/40 rounded-xl px-3.5 py-2.5 pr-9 text-sm text-foreground/80 font-medium outline-none transition-all duration-300 cursor-pointer w-full sm:w-auto min-w-[140px]"
        >
          {Object.entries(sortLabels).map(([k, label]) => (
            <option key={k} value={k} className="bg-card text-foreground">
              {label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
      </div>
    </div>
  );
}
