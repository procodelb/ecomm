"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/supabase";
import { LayoutDashboard, Package, Truck, MapPin, Heart, Star, Undo2, MessageSquare, Settings, Menu, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "", label: "Dashboard", icon: LayoutDashboard },
  { href: "orders", label: "Orders", icon: Package },
  { href: "tracking", label: "Tracking", icon: Truck },
  { href: "addresses", label: "Addresses", icon: MapPin },
  { href: "wishlist", label: "Wishlist", icon: Heart },
  { href: "reviews", label: "Reviews", icon: Star },
  { href: "returns", label: "Returns", icon: Undo2 },
  { href: "support", label: "Support", icon: MessageSquare },
  { href: "settings", label: "Settings", icon: Settings },
];

export default function AccountLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [locale, setLocale] = useState("en-AE");

  useEffect(() => { params.then((p) => setLocale(p.locale)); }, [params]);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, locale, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const segments = pathname.split("/").filter(Boolean);
  const localeIdx = segments.findIndex((s) => s === locale);
  const accountSegments = segments.slice(localeIdx + 2);
  const currentPage = accountSegments[0] || "";
  const isOverview = currentPage === "";

  return (
    <div className="flex min-h-screen bg-dark pt-20">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-dark/80 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-dark pt-20 transform transition-transform duration-300 lg:static lg:translate-x-0 lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <nav className="flex flex-col gap-0.5 p-4">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "" ? isOverview : accountSegments[0] === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={`/${locale}/account${item.href ? `/${item.href}` : ""}`}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-primary-10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-white/[0.02] hover:text-foreground border border-transparent",
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
          <Link href={`/${locale}`} className="flex items-center gap-2 text-sm text-muted-foreground/50 hover:text-muted-foreground transition-colors px-4 py-2">
            <ChevronRight className="h-3 w-3" />
            Back to store
          </Link>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-20 z-30 flex h-14 items-center gap-4 border-b border-border bg-dark/80 backdrop-blur-xl px-4 lg:px-8">
          <button className="text-muted-foreground hover:text-foreground lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground/60">My Account</span>
            {accountSegments.filter(Boolean).map((seg, i, arr) => (
              <span key={seg} className="flex items-center gap-2">
                <span className="text-muted-foreground/20">/</span>
                <span className={cn(i === arr.length - 1 ? "text-foreground capitalize" : "text-muted-foreground/40 capitalize")}>
                  {seg.replace(/-/g, " ")}
                </span>
              </span>
            ))}
          </div>
        </header>
        <main className="p-4 lg:p-8 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
