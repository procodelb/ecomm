"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ProductImage } from "@/lib/seo/image";
import { trackEvent } from "@/lib/analytics/client";

type WishlistItem = {
  id: string; productId: string; variantId: string | null; createdAt: string;
  product: { id: string; title: string; slug: string; images: unknown[]; priceAed: number; priceAud: number; status: string };
  variant: { id: string; title: string; sku: string; priceAed: number; priceAud: number; stock: number; images: unknown[] } | null;
};

export default function AccountWishlist() {
  const { locale } = useParams<{ locale: string }>();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = () => {
    fetch("/api/account/wishlist")
      .then((r) => r.json())
      .then((data) => { setItems(data.items || []); setLoading(false); });
  };

  useEffect(() => { fetchWishlist(); }, []);

  const removeItem = async (productId: string) => {
    await fetch(`/api/account/wishlist?productId=${productId}`, { method: "DELETE" });
    trackEvent("wishlist_remove", { content_ids: [productId] });
    fetchWishlist();
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Wishlist</h1>

      {items.length === 0 ? (
        <div className="rounded-xl border border-border p-12 text-center">
          <div className="text-4xl mb-3">♡</div>
          <p className="text-muted-foreground text-sm mb-3">Your wishlist is empty</p>
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-black hover:bg-primary/90 transition-colors">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="group rounded-xl border border-border bg-card p-4 hover:bg-muted/50 transition-colors">
              <Link href={`/${locale}/products/${item.product.slug}`}>
                <div className="relative flex h-40 items-center justify-center rounded-lg bg-muted/50 mb-3 text-xs text-muted-foreground/40 overflow-hidden">
                  {Array.isArray(item.product.images) && item.product.images[0]
                    ? <ProductImage src={item.product.images[0] as string} alt={item.product.title} fill sizes="(max-width: 768px) 50vw, 33vw" />
                    : "No Image"}
                </div>
                <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">{item.product.title}</h3>
                <p className="text-sm font-semibold text-foreground mt-1">
                  {locale === "en-AU" ? "AUD" : "AED"} {locale === "en-AU" ? Number(item.product.priceAud).toFixed(2) : Number(item.product.priceAed).toFixed(2)}
                </p>
              </Link>
              <button onClick={() => removeItem(item.productId)} className="mt-3 text-xs text-destructive hover:underline">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
