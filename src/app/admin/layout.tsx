"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard, ShoppingBag, Tags, Package, Link2, Users, Star, Webhook, BarChart3, Settings, PenSquare, ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Tags },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/suppliers", label: "Suppliers", icon: Link2 },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/webhooks", label: "Webhooks", icon: Webhook },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { type: "divider" as const },
  { href: "/admin/studio", label: "CMS Studio", icon: PenSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-dark">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-dark/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-dark pt-16 transform transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <nav className="flex flex-col gap-0.5 p-4">
          {NAV_ITEMS.map((item) => {
            if ("type" in item) {
              return <div key="divider" className="my-2 border-t border-border/50" />;
            }
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary-10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-white/[0.02] hover:text-foreground border border-transparent",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground/50 hover:text-muted-foreground transition-colors px-4 py-1"
          >
            <ChevronRight className="h-3 w-3" />
            Back to store
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-dark/80 backdrop-blur-xl px-4 lg:px-8">
          <button
            className="text-muted-foreground hover:text-foreground lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground/60">Admin</span>
            {pathname !== "/admin" && pathname.split("/").slice(2).map((seg, i, arr) => (
              <span key={seg} className="flex items-center gap-2">
                <span className="text-muted-foreground/20">/</span>
                <span className={cn(i === arr.length - 1 ? "text-foreground capitalize" : "text-muted-foreground/40 capitalize")}>
                  {seg.replace(/-/g, " ")}
                </span>
              </span>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground/60">System Online</span>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
