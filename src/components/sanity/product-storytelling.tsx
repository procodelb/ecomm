"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAnimateInView, useCounter } from "@/hooks/use-animate-in-view";
import { Heading, Text, Caption } from "@/components/ui";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { localize } from "./utils";

gsap.registerPlugin(ScrollTrigger);

type Stat = {
  value?: number;
  label?: { en?: string; ar?: string };
};

type Props = {
  locale: string;
  title?: { en?: string; ar?: string };
  subtitle?: { en?: string; ar?: string };
  paragraph1?: { en?: string; ar?: string };
  paragraph2?: { en?: string; ar?: string };
  stat1?: Stat;
  stat2?: Stat;
  stat3?: Stat;
};

export function ProductStorytelling({ locale, title, subtitle, paragraph1, paragraph2, stat1, stat2, stat3 }: Props) {
  const headingRef = useAnimateInView<HTMLDivElement>();
  const statsRef = useRef<HTMLDivElement>(null!);
  const count1 = useCounter<HTMLSpanElement>(stat1?.value || 0);
  const count2 = useCounter<HTMLSpanElement>(stat2?.value || 0);
  const count3 = useCounter<HTMLSpanElement>(stat3?.value || 0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(statsRef.current?.children, {
        y: 24,
        opacity: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    });
    return () => ctx.revert();
  }, []);

  const stats = [stat1, stat2, stat3].filter(Boolean);
  const countRefs = [count1, count2, count3];

  return (
    <SectionWrapper className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-primary/[0.02] blur-[200px]" />
        <div className="absolute bottom-1/3 -right-40 w-[400px] h-[400px] rounded-full bg-gold/[0.02] blur-[160px]" />
      </div>

      <div ref={headingRef} className="max-w-4xl mx-auto">
        <Caption className="mb-3 text-primary tracking-[0.15em] uppercase">
          {localize(locale, subtitle) || "Born from Innovation"}
        </Caption>
        <Heading as="h2" className="mb-8">
          {localize(locale, title) || "The Art of Aquatic Engineering"}
        </Heading>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-5">
            <Text className="text-foreground/85 leading-relaxed">
              {localize(locale, paragraph1) ||
                "Every hull, every hydrofoil, every stitch of marine-grade upholstery begins with a singular question: how do we make the extraordinary feel effortless?"}
            </Text>
          </div>
          <div className="space-y-5">
            <Text className="text-foreground/85 leading-relaxed">
              {localize(locale, paragraph2) ||
                "From the design studios of Milan to the testing waters of the Arabian Gulf, our team of engineers and artisans push beyond convention."}
            </Text>
          </div>
        </div>

        {stats.length > 0 && (
          <div ref={statsRef} className="grid grid-cols-3 gap-6 sm:gap-10 mt-14 pt-14 border-t border-border">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex items-baseline justify-center gap-0.5">
                  <span
                    ref={countRefs[i]}
                    className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground"
                  >
                    0
                  </span>
                </div>
                <Caption className="text-muted-foreground/70 mt-1.5">
                  {localize(locale, stat?.label)}
                </Caption>
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
