"use client";

import { useAnimateInView } from "@/hooks/use-animate-in-view";
import { Heading, Caption } from "@/components/ui";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { localize } from "./utils";

const badges = [
  { label: "ISO 9001", desc: "Certified" },
  { label: "CE Marked", desc: "EU Compliance" },
  { label: "5-Star", desc: "Trustpilot" },
  { label: "Carbon Neutral", desc: "Certified" },
  { label: "Made in Italy", desc: "Design" },
  { label: "Dubai Chamber", desc: "Approved" },
];

type Props = {
  locale: string;
  title?: { en?: string; ar?: string };
  subtitle?: { en?: string; ar?: string };
};

export function TrustBadges({ locale, title, subtitle }: Props) {
  const ref = useAnimateInView<HTMLDivElement>();

  return (
    <SectionWrapper compact className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-[0.015]">
        <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-primary blur-[160px]" />
      </div>
      <div ref={ref} className="text-center mb-10">
        <Caption className="mb-2 text-muted-foreground tracking-[0.15em] uppercase">
          {localize(locale, subtitle) || "In Partnership With"}
        </Caption>
        <Heading as="h3" className="text-2xl sm:text-3xl">
          {localize(locale, title) || "Trusted by the World's Best"}
        </Heading>
      </div>
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 max-w-4xl mx-auto">
        {badges.map((badge, i) => (
          <div
            key={i}
            className="group flex flex-col items-center gap-1.5 px-5 py-4 sm:px-7 sm:py-5 rounded-2xl border border-border bg-card hover:border-white/10 hover:bg-white/[0.015] transition-all duration-400 min-w-[120px]"
          >
            <span className="font-heading font-bold text-sm sm:text-base text-foreground tracking-tight">
              {badge.label}
            </span>
            <span className="text-[0.625rem] tracking-widest uppercase text-muted-foreground/60">
              {badge.desc}
            </span>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
