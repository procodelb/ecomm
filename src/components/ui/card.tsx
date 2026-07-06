"use client";

import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  gold?: boolean;
  elevated?: boolean;
  padding?: "sm" | "md" | "lg";
}

const paddingMap = {
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export function Card({ children, className, hover, glass, gold, elevated, padding = "md" }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card transition-all duration-500",
        paddingMap[padding],
        glass && "glass-card",
        gold && "border-gold/10",
        elevated && "shadow-elevated",
        hover && "hover:border-white/10 hover:bg-white/[0.015] hover:-translate-y-0.5 cursor-pointer",
        !glass && !gold && "border-border",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={cn("mb-5", className)}>{children}</div>;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn("", className)}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div
      className={cn(
        "mt-5 flex items-center gap-3 pt-5 border-t border-border",
        className,
      )}
    >
      {children}
    </div>
  );
}
