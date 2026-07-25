"use client";

import Link from "next/link";
import { useLocale } from "next-intl";

const footerLinks = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "All Products" },
      { href: "/categories", label: "Categories" },
      { href: "/new-arrivals", label: "New Arrivals" },
      { href: "/best-sellers", label: "Best Sellers" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/about#contact", label: "Contact Us" },
      { href: "/shipping", label: "Shipping & Delivery" },
      { href: "/returns", label: "Returns & Exchanges" },
      { href: "/warranty", label: "Warranty" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/careers", label: "Careers" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];

const socialLinks = [
  { name: "Instagram", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
  { name: "Facebook", icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  { name: "X (Twitter)", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
];

const paymentIcons = ["visa", "mastercard", "amex", "paypal", "applepay", "googlepay"];

export function Footer() {
  const locale = useLocale();

  return (
    <footer className="relative border-t border-border bg-dark">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="container-luxury px-6 md:px-10 lg:px-16 py-16 lg:py-24">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 lg:gap-16">
          <div className="col-span-2 md:col-span-2">
            <Link href={`/${locale}`} className="flex items-center gap-3 group mb-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary font-heading text-sm font-bold group-hover:bg-primary/15 transition-all duration-300">
                E
              </span>
              <span className="font-heading text-lg font-bold tracking-[0.15em] text-foreground">
                ECOMM
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
              Curating the finest products for discerning customers across UAE, Dubai, and Australia. Experience luxury redefined.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/[0.04] transition-all duration-300"
                  aria-label={s.name}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d={s.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="font-heading text-[0.625rem] tracking-[0.15em] uppercase text-muted-foreground mb-5 font-semibold">
                {group.title}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={`/${locale}${link.href}`}
                      className="text-sm text-muted-foreground/70 hover:text-foreground transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-xs text-muted-foreground/40 font-heading tracking-wider">
              &copy; {new Date().getFullYear()} ECOMM. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              {paymentIcons.map((icon) => (
                <span
                  key={icon}
                  className="text-[0.5rem] tracking-widest uppercase text-muted-foreground/20 font-heading px-2.5 py-1.5 rounded-lg border border-white/[0.04] bg-white/[0.01]"
                >
                  {icon}
                </span>
              ))}
            </div>
            <div className="flex gap-4 text-[0.625rem] text-muted-foreground/30 font-heading tracking-wider">
              <span>UAE &middot; Dubai</span>
              <span>Australia &middot; Sydney</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
