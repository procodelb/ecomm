"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  href?: string;
  icon?: LucideIcon;
  accent?: "primary" | "gold" | "rose" | "violet";
  className?: string;
}

const accentStyles = {
  primary: "bg-primary-10 border-primary/20 text-primary",
  gold: "bg-gold-10 border-gold/20 text-gold",
  rose: "bg-rose-500/10 border-rose-500/20 text-rose-400",
  violet: "bg-violet-500/10 border-violet-500/20 text-violet-400",
};

export function StatCard({ label, value, href, icon: Icon, accent = "primary", className }: StatCardProps) {
  const baseCn = cn(
    "group rounded-xl border border-border bg-card p-5 transition-all duration-300",
    href && "hover:border-primary/20 hover:bg-white/[0.02] cursor-pointer",
    className,
  );

  const content = (
    <>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-muted-foreground font-medium tracking-wide">{label}</p>
        {Icon && (
          <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center", accentStyles[accent])}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{value}</p>
    </>
  );

  if (href) {
    return <Link href={href} className={baseCn}>{content}</Link>;
  }
  return <div className={baseCn}>{content}</div>;
}
