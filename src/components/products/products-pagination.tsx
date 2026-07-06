"use client";

import { cn } from "@/lib/utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductsPaginationProps {
  page: number;
  pages: number;
  onPage: (page: number) => void;
  className?: string;
}

export function ProductsPagination({ page, pages, onPage, className }: ProductsPaginationProps) {
  if (pages <= 1) return null;

  const getPages = (): (number | "...")[] => {
    const items: (number | "...")[] = [];
    if (pages <= 7) {
      for (let i = 1; i <= pages; i++) items.push(i);
    } else {
      items.push(1);
      if (page > 3) items.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) {
        items.push(i);
      }
      if (page < pages - 2) items.push("...");
      items.push(pages);
    }
    return items;
  };

  return (
    <nav className={cn("flex items-center justify-center gap-1.5", className)}>
      <button
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.03] disabled:opacity-20 disabled:pointer-events-none transition-all duration-300"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Prev</span>
      </button>

      {getPages().map((item, i) =>
        item === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm text-muted-foreground/30">
            ...
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onPage(item)}
            className={cn(
              "min-w-[36px] h-9 rounded-xl text-sm font-heading font-medium transition-all duration-300",
              page === item
                ? "bg-primary text-primary-foreground shadow-[0_0_16px_rgba(0,212,255,0.15)]"
                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]",
            )}
          >
            {item}
          </button>
        ),
      )}

      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= pages}
        className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.03] disabled:opacity-20 disabled:pointer-events-none transition-all duration-300"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
