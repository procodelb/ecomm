"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-heading font-medium transition-all duration-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-25 select-none active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-dark hover:brightness-110 shadow-[0_0_16px_rgba(0,212,255,0.08)] hover:shadow-[0_0_32px_rgba(0,212,255,0.16)]",
        gold:
          "bg-gold text-dark hover:brightness-110 shadow-[0_0_16px_rgba(255,215,0,0.08)] hover:shadow-[0_0_32px_rgba(255,215,0,0.16)]",
        outline:
          "border border-white/10 bg-transparent hover:border-primary/30 hover:text-primary",
        ghost:
          "bg-transparent hover:bg-white/[0.04] text-muted-foreground hover:text-foreground",
        dark:
          "bg-white/90 text-dark hover:bg-white",
        destructive:
          "bg-destructive/90 text-white hover:bg-destructive",
      },
      size: {
        sm: "h-9 px-4 text-xs tracking-widest uppercase rounded-lg gap-1.5",
        md: "h-11 px-5 text-sm tracking-wider rounded-xl gap-2",
        lg: "h-12 px-7 text-sm tracking-wider rounded-xl gap-2",
        xl: "h-14 px-9 text-sm tracking-wider rounded-xl gap-2.5",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
