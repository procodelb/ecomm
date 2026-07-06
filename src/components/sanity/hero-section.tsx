"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { Button, Heading, Text, Caption } from "@/components/ui";
import { localize } from "./utils";

type Props = {
  locale: string;
  title?: { en?: string; ar?: string };
  subtitle?: { en?: string; ar?: string };
  ctaText?: { en?: string; ar?: string };
  ctaLink?: string;
  secondaryCtaText?: { en?: string; ar?: string };
  secondaryCtaLink?: string;
  backgroundImage?: string;
  textAlign?: "left" | "center" | "right";
};

export function HeroSection({
  locale,
  title,
  subtitle,
  ctaText,
  ctaLink = "/products",
  secondaryCtaText,
  secondaryCtaLink = "/about",
  backgroundImage,
  textAlign = "center",
}: Props) {
  const sectionRef = useRef<HTMLElement>(null!);
  const contentRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(contentRef.current, {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
        delay: 0.2,
      });
    });
    return () => ctx.revert();
  }, []);

  const alignClass =
    textAlign === "left" ? "items-start text-left" : textAlign === "right" ? "items-end text-right" : "items-center text-center";

  return (
    <section ref={sectionRef} className="relative min-h-[90vh] flex items-center pt-28 pb-20 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        {backgroundImage ? (
          <img src={backgroundImage} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-dark via-dark/95 to-primary/[0.02]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-dark/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.05)_0%,transparent_70%)]" />
      </div>

      <div
        ref={contentRef}
        className={`flex flex-col mx-auto max-w-4xl relative z-10 px-6 md:px-10 lg:px-16 ${alignClass}`}
      >
        {subtitle && (
          <Caption className="mb-5 text-primary tracking-[0.2em] uppercase inline-flex items-center gap-2">
            <span className="w-8 h-px bg-primary/60" />
            {localize(locale, subtitle) || "Redefining Excellence"}
          </Caption>
        )}
        <Heading as="h1" gradient="white" className="mb-5 leading-[1.05]">
          {localize(locale, title) || "Where Innovation<br/>Meets Luxury"}
        </Heading>
        <Text
          size="lg"
          muted
          className={`max-w-xl ${textAlign === "center" ? "mx-auto" : ""} mb-10 leading-relaxed text-base opacity-80`}
        >
          Curating the finest water toys across UAE, Dubai, and Australia. Experience luxury redefined.
        </Text>
        <div className={`flex flex-col sm:flex-row items-center gap-4 ${textAlign === "center" ? "justify-center" : ""}`}>
          <Link href={ctaLink}>
            <Button variant="primary" size="xl">
              {localize(locale, ctaText) || "Explore Collection"}
            </Button>
          </Link>
          {secondaryCtaText && (
            <Link href={secondaryCtaLink}>
              <Button variant="outline" size="xl">
                {localize(locale, secondaryCtaText)}
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-float">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/20">
          <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}
