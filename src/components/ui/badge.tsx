import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-[0.625rem] sm:text-xs font-medium font-heading tracking-wider transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-primary-10 text-primary border border-primary/20",
        gold: "bg-[rgba(255,215,0,0.08)] text-gold border border-gold/20",
        outline: "border border-border text-muted-foreground",
        dot: "bg-primary-10 text-primary border border-primary/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
