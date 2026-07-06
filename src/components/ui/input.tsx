"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border bg-card px-4 py-2 text-sm text-foreground transition-all duration-300 placeholder:text-muted-foreground/40",
          "border-input hover:border-input-hover",
          "focus-visible:outline-none focus-visible:border-input-focus focus-visible:shadow-[0_0_0_1px_rgba(0,212,255,0.15)]",
          "disabled:cursor-not-allowed disabled:opacity-40",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
