"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Text, Caption } from "@/components/ui";
import { localize } from "./utils";

gsap.registerPlugin(ScrollTrigger);

type FooterColumn = {
  title?: { en?: string; ar?: string };
  links?: { label?: { en?: string; ar?: string }; href?: string }[];
};

type Props = {
  locale: string;
  columns?: FooterColumn[];
  copyright?: { en?: string; ar?: string };
};

const defaultColumns: FooterColumn[] = [
  {
    title: { en: "Collections" },
    links: [
      { label: { en: "Jet Skis" }, href: "/products?category=jet-skis" },
      { label: { en: "Yachts" }, href: "/products?category=yachts" },
      { label: { en: "Water Sports" }, href: "/products?category=water-sports" },
      { label: { en: "Accessories" }, href: "/products?category=accessories" },
    ],
  },
  {
    title: { en: "Support" },
    links: [
      { label: { en: "Contact Us" }, href: "/contact" },
      { label: { en: "Shipping & Returns" }, href: "/shipping" },
      { label: { en: "Warranty" }, href: "/warranty" },
      { label: { en: "FAQ" }, href: "/faq" },
    ],
  },
  {
    title: { en: "Company" },
    links: [
      { label: { en: "About Us" }, href: "/about" },
      { label: { en: "Careers" }, href: "/careers" },
      { label: { en: "Press" }, href: "/press" },
      { label: { en: "Privacy Policy" }, href: "/privacy" },
    ],
  },
];

const socialLinks = [
  { label: "IG", href: "#" },
  { label: "X", href: "#" },
  { label: "YT", href: "#" },
  { label: "TT", href: "#" },
];

export function AnimatedFooter({ locale, columns = defaultColumns, copyright }: Props) {
  const footerRef = useRef<HTMLElement>(null!);
  const topBarRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(topBarRef.current, {
        scaleX: 0,
        transformOrigin: "left center",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top bottom",
          toggleActions: "play none none none",
        },
        duration: 1.2,
        ease: "power3.out",
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative bg-dark border-t border-border overflow-hidden"
    >
      <div
        ref={topBarRef}
        className="h-[2px] bg-gradient-to-r from-primary via-gold to-primary"
        style={{ transform: "scaleX(0)" }}
      />

      <div className="container-luxury px-6 md:px-10 lg:px-16 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-14">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-heading font-bold tracking-tight">
                <span className="text-primary">ECOMM</span>
                <span className="text-gold">.</span>
              </span>
            </Link>
            <Text size="sm" muted className="mb-6 max-w-xs leading-relaxed">
              Premium water toys and luxury watercraft for the discerning few.
              Curated excellence delivered worldwide.
            </Text>
            <div className="flex gap-2.5">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-[0.625rem] tracking-widest uppercase text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/[0.04] transition-all duration-300"
                  aria-label={s.label}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {columns.map((col, i) => (
            <div key={i}>
              <Caption className="mb-4 text-primary tracking-[0.15em] uppercase">
                {localize(locale, col.title)}
              </Caption>
              <ul className="space-y-3">
                {(col.links || []).map((link, j) => (
                  <li key={j}>
                    <Link
                      href={link.href || "#"}
                      className="text-sm text-muted-foreground/70 hover:text-foreground transition-colors duration-300"
                    >
                      {localize(locale, link.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <Text size="xs" className="text-muted-foreground/40">
            {localize(locale, copyright) || `© ${new Date().getFullYear()} ECOMM. All rights reserved.`}
          </Text>
          <div className="flex gap-5 text-xs text-muted-foreground/50">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
