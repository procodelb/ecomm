"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

interface ProductGridProps {
  children: ReactNode;
  className?: string;
}

export function ProductGrid({ children, className }: ProductGridProps) {
  const ref = useRef<HTMLDivElement>(null!);

  return (
    <div
      ref={ref}
      className={cn(
        "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5",
        className,
      )}
    >
      {children}
    </div>
  );
}
