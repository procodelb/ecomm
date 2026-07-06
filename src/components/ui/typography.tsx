import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

type HeadingLevel = "h1" | "h2" | "h3" | "h4";

interface HeadingProps {
  as?: HeadingLevel;
  children: ReactNode;
  className?: string;
  gradient?: "primary" | "gold" | "white" | "subtle";
}

const headingStyles = {
  h1: "text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05]",
  h2: "text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]",
  h3: "text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight leading-[1.15]",
  h4: "text-xl sm:text-2xl font-semibold tracking-tight leading-[1.2]",
};

const gradientClasses = {
  primary: "text-gradient-primary",
  gold: "text-gradient-gold",
  white: "text-gradient-white",
  subtle: "text-gradient-subtle",
};

export function Heading({ as: Tag = "h2", children, className, gradient }: HeadingProps) {
  return (
    <Tag
      className={cn(
        "font-heading",
        headingStyles[Tag],
        gradient && gradientClasses[gradient],
        !gradient && "text-foreground",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

interface TextProps {
  children: ReactNode;
  className?: string;
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  muted?: boolean;
  as?: "p" | "span" | "div";
}

const textSizes = {
  xs: "text-xs leading-relaxed",
  sm: "text-sm leading-relaxed",
  base: "text-base leading-relaxed",
  lg: "text-lg leading-relaxed",
  xl: "text-xl leading-relaxed",
};

const textWeights = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

export function Text({
  children,
  className,
  size = "base",
  weight = "normal",
  muted,
  as: Tag = "p",
}: TextProps) {
  return (
    <Tag
      className={cn(
        textSizes[size],
        textWeights[weight],
        muted && "text-muted-foreground",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

interface CaptionProps {
  children: ReactNode;
  className?: string;
}

export function Caption({ children, className }: CaptionProps) {
  return (
    <span
      className={cn(
        "text-[0.625rem] sm:text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}
