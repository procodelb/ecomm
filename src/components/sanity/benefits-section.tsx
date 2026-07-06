"use client";

import { useAnimateInView, useCounter } from "@/hooks/use-animate-in-view";
import { Heading, Text, Caption } from "@/components/ui";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { localize } from "./utils";
import { Shield, Truck, Clock, Headphones } from "lucide-react";

type Benefit = {
  _key?: string;
  icon?: string;
  title?: { en?: string; ar?: string };
  description?: { en?: string; ar?: string };
  stat?: number;
  statLabel?: { en?: string; ar?: string };
  suffix?: string;
};

const defaultBenefits: Benefit[] = [
  { icon: "truck", title: { en: "Complimentary Shipping" }, description: { en: "On orders over 1,000 AED within UAE" }, stat: 1000, statLabel: { en: "AED Free Shipping" }, suffix: "+" },
  { icon: "clock", title: { en: "White-Glove Delivery" }, description: { en: "Professional setup and orientation included" }, stat: 48, statLabel: { en: "Hour Delivery" }, suffix: "h" },
  { icon: "shield", title: { en: "Extended Warranty" }, description: { en: "5-year premium coverage on all watercraft" }, stat: 5, statLabel: { en: "Year Warranty" }, suffix: "+" },
  { icon: "headphones", title: { en: "Concierge Support" }, description: { en: "24/7 dedicated assistance, priority response" }, stat: 247, statLabel: { en: "Support" }, suffix: "" },
];

const iconMap: Record<string, React.ReactNode> = {
  truck: <Truck className="h-6 w-6" />,
  clock: <Clock className="h-6 w-6" />,
  shield: <Shield className="h-6 w-6" />,
  headphones: <Headphones className="h-6 w-6" />,
};

export function BenefitsSection({ locale, title, subtitle, benefits = defaultBenefits }: { locale: string; title?: { en?: string; ar?: string }; subtitle?: { en?: string; ar?: string }; benefits?: Benefit[] }) {
  const headingRef = useAnimateInView<HTMLDivElement>();

  return (
    <SectionWrapper className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-[0.03]">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-gold blur-[150px]" />
      </div>

      <div ref={headingRef} className="text-center mb-14">
        <Caption className="mb-3 text-primary tracking-[0.15em] uppercase">
          {localize(locale, subtitle) || "The ECOMM Standard"}
        </Caption>
        <Heading as="h2">
          A <span className="text-gradient-gold">Premium</span> Experience
        </Heading>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {benefits.map((b, i) => (
          <BenefitCard key={b._key || i} benefit={b} locale={locale} index={i} />
        ))}
      </div>
    </SectionWrapper>
  );
}

function BenefitCard({ benefit, locale, index }: { benefit: Benefit; locale: string; index: number }) {
  const cardRef = useAnimateInView<HTMLDivElement>({ from: { opacity: 0, y: 30 }, delay: index * 0.08 });
  const statRef = useCounter<HTMLSpanElement>(benefit.stat || 0);

  return (
    <div
      ref={cardRef}
      className="group relative text-center p-6 sm:p-7 rounded-2xl border border-border bg-card hover:border-white/10 transition-all duration-500"
    >
      <div className="w-12 h-12 rounded-xl bg-primary-10 border border-primary/10 flex items-center justify-center mx-auto mb-5 text-primary group-hover:bg-primary-20 group-hover:shadow-[0_0_16px_rgba(0,212,255,0.06)] transition-all duration-300">
        {benefit.icon && iconMap[benefit.icon] ? iconMap[benefit.icon] : <span className="text-xl">{benefit.icon}</span>}
      </div>
      <Heading as="h4" className="mb-2">
        {localize(locale, benefit.title)}
      </Heading>
      <Text size="sm" muted className="mb-5">
        {localize(locale, benefit.description)}
      </Text>
      <div className="flex items-baseline justify-center gap-1">
        <span ref={statRef} className="text-2xl font-heading font-bold text-gold">0</span>
        <span className="text-gold/80 text-base">{benefit.suffix}</span>
      </div>
      <Caption className="text-gold/60 mt-1">
        {localize(locale, benefit.statLabel)}
      </Caption>
    </div>
  );
}
