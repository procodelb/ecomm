"use client";

import { cn } from "@/lib/utils/cn";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  draft: "bg-muted text-muted-foreground border-border",
  discontinued: "bg-destructive/10 text-destructive border-destructive/20",
  out_of_stock: "bg-warning/10 text-warning border-warning/20",
  coming_soon: "bg-primary-10 text-primary border-primary/20",
  in_stock: "bg-success/10 text-success border-success/20",
  low_stock: "bg-warning/10 text-warning border-warning/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  confirmed: "bg-primary-10 text-primary border-primary/20",
  processing: "bg-primary-10 text-primary border-primary/20",
  shipped: "bg-primary-10 text-primary border-primary/20",
  in_transit: "bg-primary-10 text-primary border-primary/20",
  delivered: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  refunded: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  payment_received: "bg-success/10 text-success border-success/20",
  payment_pending: "bg-warning/10 text-warning border-warning/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  success: "bg-success/10 text-success border-success/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
  syncing: "bg-primary-10 text-primary border-primary/20",
  connected: "bg-success/10 text-success border-success/20",
  disconnected: "bg-destructive/10 text-destructive border-destructive/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const color = statusColors[status] || "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.625rem] font-heading font-medium border capitalize tracking-wide",
        color,
        className,
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
