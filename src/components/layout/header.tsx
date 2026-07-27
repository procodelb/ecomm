"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui";
import { useCart } from "@/providers/cart";
import { useAuth } from "@/providers/supabase";
import { getAuthLabels } from "@/lib/locale/auth-labels";
import { ShoppingBag, Search, Menu, X, LogOut, User, Package } from "lucide-react";

const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/about#contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

function AuthPlaceholder() {
  return (
    <div className="hidden lg:flex items-center gap-2 ml-2">
      <div className="h-9 w-[80px] rounded-xl bg-white/[0.03] animate-pulse" />
      <div className="h-9 w-[110px] rounded-xl bg-white/[0.03] animate-pulse" />
    </div>
  );
}

export function Header() {
  const locale = useLocale();
  const { user, loading, signOut } = useAuth();
  const t = getAuthLabels(locale);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const lastScroll = useRef(0);
  const { totalItems, openDrawer } = useCart();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 200 && y > lastScroll.current);
      lastScroll.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  async function handleSignOut() {
    if (loggingOut) return;
    setLoggingOut(true);
    setMobileOpen(false);
    await signOut();
    setLoggingOut(false);
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled ? "glass-dark shadow-[0_1px_0_rgba(255,255,255,0.04)]" : "bg-transparent",
        hidden && !mobileOpen && "-translate-y-full",
      )}
    >
      <div className="container-luxury px-6 md:px-10 lg:px-16">
        <div className="flex h-20 items-center justify-between">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3 group"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary font-heading text-sm font-bold group-hover:bg-primary/15 group-hover:shadow-[0_0_16px_rgba(0,212,255,0.08)] transition-all duration-300">
              E
            </span>
            <span className="font-heading text-lg font-bold tracking-[0.15em] text-foreground">
              ECOMM
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={`/${locale}${link.href}`}
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 rounded-xl hover:bg-white/[0.03]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            {loading ? (
              <AuthPlaceholder />
            ) : user ? (
              <div className="hidden lg:flex items-center gap-1">
                <Link href={`/${locale}/account`}>
                  <Button variant="ghost" size="sm" className="gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    <User className="h-4 w-4" />
                    {t.myAccount}
                  </Button>
                </Link>
                <Link href={`/${locale}/account/orders`}>
                  <Button variant="ghost" size="sm" className="gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    <Package className="h-4 w-4" />
                    {t.myOrders}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={handleSignOut}
                  disabled={loggingOut}
                  aria-label={t.logOut}
                >
                  <LogOut className="h-4 w-4" />
                  {loggingOut ? "..." : t.logOut}
                </Button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link href={`/${locale}/login`}>
                  <Button variant="ghost" size="sm" className="text-sm font-medium">
                    {t.signIn}
                  </Button>
                </Link>
                <Link href={`/${locale}/register`}>
                  <Button size="sm" className="text-sm font-medium">
                    {t.createAccount}
                  </Button>
                </Link>
              </div>
            )}

            <Link href={`/${locale}/search`}>
              <Button variant="ghost" size="icon" aria-label="Search">
                <Search className="h-[18px] w-[18px]" />
              </Button>
            </Link>

            <button onClick={openDrawer} className="relative" aria-label="Open cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-[18px] w-[18px]" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full bg-primary text-[10px] font-bold text-dark tabular-nums leading-none">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Button>
            </button>

            <LocaleSwitcher />

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex items-center justify-center h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "lg:hidden fixed inset-0 top-20 z-40 bg-dark/98 backdrop-blur-2xl transition-all duration-400 overflow-y-auto",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      >
        <div className="flex flex-col gap-1 p-6 pt-8 pb-24">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={`/${locale}${link.href}`}
              onClick={() => setMobileOpen(false)}
              className="px-4 py-4 text-lg font-heading font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.03] rounded-xl transition-all duration-300"
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-6 pt-6 border-t border-border px-4 space-y-3">
            {loading ? (
              <div className="space-y-3">
                <div className="h-12 w-full rounded-xl bg-white/[0.03] animate-pulse" />
                <div className="h-12 w-full rounded-xl bg-white/[0.03] animate-pulse" />
              </div>
            ) : user ? (
              <>
                <Link href={`/${locale}/account`} onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="lg" className="w-full gap-2">
                    <User className="h-4 w-4" />
                    {t.myAccount}
                  </Button>
                </Link>
                <Link href={`/${locale}/account/orders`} onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="lg" className="w-full gap-2">
                    <Package className="h-4 w-4" />
                    {t.myOrders}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full gap-2 text-muted-foreground"
                  onClick={handleSignOut}
                  disabled={loggingOut}
                  aria-label={t.logOut}
                >
                  <LogOut className="h-4 w-4" />
                  {loggingOut ? "..." : t.logOut}
                </Button>
              </>
            ) : (
              <>
                <Link href={`/${locale}/login`} onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" size="lg" className="w-full">
                    {t.signIn}
                  </Button>
                </Link>
                <Link href={`/${locale}/register`} onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="lg" className="w-full">
                    {t.createAccount}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function LocaleSwitcher() {
  const locale = useLocale();

  return (
    <div className="relative group">
      <select
        value={locale}
        onChange={(e) => {
          const path = window.location.pathname.replace(/^\/[^\/]+/, `/${e.target.value}`);
          window.location.href = path;
        }}
        className="appearance-none bg-transparent text-[0.625rem] tracking-widest uppercase text-muted-foreground border border-border rounded-xl px-3 py-2 pr-7 font-heading font-medium focus:outline-none focus:border-primary/30 hover:border-border-hover hover:text-foreground transition-all duration-300 cursor-pointer"
      >
        <option value="en-AE" className="bg-dark text-foreground">UAE</option>
        <option value="en-AU" className="bg-dark text-foreground">AU</option>
        <option value="ar-AE" className="bg-dark text-foreground">عربي</option>
      </select>
      <svg className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
