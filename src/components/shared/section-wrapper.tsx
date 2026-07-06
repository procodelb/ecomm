import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  id?: string;
  dark?: boolean;
  gold?: boolean;
  gradient?: boolean;
  glass?: boolean;
  compact?: boolean;
}

export function SectionWrapper({
  children,
  className,
  id,
  dark,
  gold,
  gradient,
  glass,
  compact,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative overflow-hidden",
        compact ? "py-12 sm:py-16 lg:py-20" : "py-16 sm:py-20 lg:py-28",
        dark && "bg-dark text-white",
        gold && "bg-gradient-to-br from-[rgba(255,215,0,0.03)] via-background to-[rgba(255,215,0,0.03)]",
        gradient && "bg-gradient-to-b from-background via-primary-10 to-background",
        glass && "glass-dark",
        !dark && !gold && !gradient && !glass && "bg-background",
        className,
      )}
    >
      {gradient && (
        <>
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gold/5 blur-3xl" />
        </>
      )}
      <div className="container-luxury relative z-10 px-6 md:px-10 lg:px-16">
        {children}
      </div>
    </section>
  );
}

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("container-luxury px-6 md:px-10 lg:px-16", className)}>
      {children}
    </div>
  );
}

interface GridProps {
  children: ReactNode;
  className?: string;
  cols?: 2 | 3 | 4;
}

export function Grid({ children, className, cols = 3 }: GridProps) {
  return (
    <div
      className={cn(
        "grid gap-6 sm:gap-8",
        {
          "grid-cols-1 sm:grid-cols-2": cols === 2,
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3": cols === 3,
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4": cols === 4,
        },
        className,
      )}
    >
      {children}
    </div>
  );
}
