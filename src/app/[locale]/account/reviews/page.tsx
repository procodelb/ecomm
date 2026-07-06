"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ProductImage } from "@/lib/seo/image";

type Review = {
  id: string; rating: number; title: string | null; body: string | null;
  status: string; createdAt: string; verifiedPurchase: boolean;
  product: { id: string; title: string; slug: string; images: unknown[] };
};

export default function AccountReviews() {
  const { locale } = useParams<{ locale: string }>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/account/reviews")
      .then((r) => r.json())
      .then((data) => { setReviews(data.reviews || []); setLoading(false); });
  }, []);

  if (loading) return <div className="flex items-center justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">My Reviews</h1>

      {reviews.length === 0 ? (
        <div className="rounded-xl border border-border p-12 text-center">
          <div className="text-4xl mb-3">⭐</div>
          <p className="text-muted-foreground text-sm mb-3">No reviews yet</p>
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-black hover:bg-primary/90 transition-colors">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start gap-4">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-xs text-muted-foreground/40 overflow-hidden">
                  {review.product.images?.[0]
                    ? <ProductImage src={review.product.images[0] as string} alt={review.product.title} fill sizes="56px" />
                    : "IMG"}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/${locale}/products/${review.product.slug}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                    {review.product.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={`text-xs ${i < review.rating ? "text-gold" : "text-muted-foreground/20"}`}>★</span>
                      ))}
                    </div>
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize ${
                      review.status === "approved" ? "bg-success/10 text-success" :
                      review.status === "pending" ? "bg-warning/10 text-warning" :
                      review.status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-muted/50 text-muted-foreground"
                    }`}>{review.status}</span>
                    {review.verifiedPurchase && <span className="text-[10px] text-primary">✓ Verified</span>}
                  </div>
                  {review.title && <p className="text-sm font-medium text-foreground/80 mt-2">{review.title}</p>}
                  {review.body && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{review.body}</p>}
                  <p className="text-xs text-muted-foreground mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
