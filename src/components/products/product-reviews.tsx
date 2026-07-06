"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Heading, Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/locale/config";
import { Star, ThumbsUp, ChevronDown, ChevronUp, Quote } from "lucide-react";
import { ProductImage } from "@/lib/seo/image";
import type { ProductPageReview } from "@/lib/api/product-page";

interface ProductReviewsProps {
  reviews: ProductPageReview[];
  averageRating: number;
  reviewCount: number;
  locale: string;
  className?: string;
}

type SortOption = "newest" | "highest" | "lowest";

export function ProductReviews({
  reviews,
  averageRating,
  reviewCount,
  locale,
  className,
}: ProductReviewsProps) {
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showAll, setShowAll] = useState(false);
  const initialCount = 5;

  const ratingDistribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of reviews) {
      if (r.rating >= 1 && r.rating <= 5) {
        dist[r.rating as keyof typeof dist]++;
      }
    }
    return dist;
  }, [reviews]);

  const sorted = useMemo(() => {
    const copy = [...reviews];
    switch (sortBy) {
      case "newest":
        return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "highest":
        return copy.sort((a, b) => b.rating - a.rating);
      case "lowest":
        return copy.sort((a, b) => a.rating - b.rating);
    }
  }, [reviews, sortBy]);

  const displayed = showAll ? sorted : sorted.slice(0, initialCount);

  if (reviews.length === 0) {
    return (
      <div className={cn("text-center space-y-4 py-16", className)}>
        <Heading as="h3" gradient="primary">
          Reviews
        </Heading>
        <Text muted>No reviews yet. Be the first to share your experience.</Text>
      </div>
    );
  }

  return (
    <div className={cn("space-y-8", className)}>
      <div className="text-center space-y-2">
        <Heading as="h3" gradient="primary">
          Customer Reviews
        </Heading>
        <Text muted>Real feedback from verified purchasers</Text>
      </div>

      {/* Rating Summary */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 p-6 sm:p-8 rounded-2xl bg-card border border-border">
        <div className="flex flex-col items-center justify-center min-w-[160px]">
          <span className="font-heading text-5xl sm:text-6xl font-bold text-foreground tracking-tight">
            {averageRating.toFixed(1)}
          </span>
          <div className="flex gap-0.5 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "h-4 w-4",
                  star <= Math.round(averageRating)
                    ? "text-gold fill-gold"
                    : "text-muted-foreground/20",
                )}
              />
            ))}
          </div>
          <Text size="xs" muted className="mt-1.5">
            {reviewCount} review{reviewCount !== 1 ? "s" : ""}
          </Text>
        </div>

        <div className="flex-1 space-y-2">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = ratingDistribution[star];
            const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2.5 text-sm">
                <span className="w-2 text-right text-muted-foreground/60 font-medium">{star}</span>
                <Star className="h-3 w-3 text-gold fill-gold" />
                <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-gold to-gold/60"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: star * 0.1 }}
                  />
                </div>
                <span className="w-8 text-right text-xs text-muted-foreground/50 font-mono">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sort */}
      <div className="flex items-center justify-between">
        <Text size="sm" muted>
          <span className="text-foreground font-medium">{reviewCount}</span> review{reviewCount !== 1 ? "s" : ""}
        </Text>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="appearance-none bg-card border border-border hover:border-primary/20 rounded-xl px-3.5 py-2 pr-8 text-sm text-foreground/80 outline-none transition-all duration-300 cursor-pointer"
          >
            <option value="newest" className="bg-card">Most Recent</option>
            <option value="highest" className="bg-card">Highest Rated</option>
            <option value="lowest" className="bg-card">Lowest Rated</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {displayed.map((review) => (
          <div
            key={review.id}
            className="p-5 sm:p-6 rounded-2xl bg-card border border-border space-y-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-3.5 w-3.5",
                        star <= review.rating
                          ? "text-gold fill-gold"
                          : "text-muted-foreground/20",
                      )}
                    />
                  ))}
                </div>
                {review.title && (
                  <span className="font-heading text-sm font-semibold text-foreground block">
                    {review.title}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {review.verifiedPurchase && (
                  <Badge variant="outline" dot>Verified</Badge>
                )}
              </div>
            </div>

            {/* Body */}
            {review.body && (
              <Text size="sm" muted className="leading-relaxed">
                <Quote className="h-3 w-3 inline mr-1 text-muted-foreground/30 -mt-0.5" />
                {review.body}
              </Text>
            )}

            {/* Pros / Cons */}
            {(review.pros.length > 0 || review.cons.length > 0) && (
              <div className="flex flex-wrap gap-4">
                {review.pros.length > 0 && (
                  <div>
                    <span className="text-[0.5625rem] tracking-wider uppercase text-success font-medium mb-1.5 block">
                      Pros
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {review.pros.map((p, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-success/10 text-success border border-success/20">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {review.cons.length > 0 && (
                  <div>
                    <span className="text-[0.5625rem] tracking-wider uppercase text-destructive font-medium mb-1.5 block">
                      Cons
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {review.cons.map((c, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Images */}
            {review.images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {review.images.map((img, i) => (
                  <div key={i} className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border border-border">
                    <ProductImage
                      src={img}
                      alt={`Review image ${i + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-1 border-t border-border/50">
              <Text size="xs" muted className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-full bg-primary-10 border border-primary/20 flex items-center justify-center text-[0.5rem] font-heading font-bold text-primary uppercase">
                  {(review.customerName ?? "A").charAt(0)}
                </span>
                {review.customerName ?? "Anonymous"}
                <span className="text-muted-foreground/30">·</span>
                {formatDate(review.createdAt, locale)}
              </Text>
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-primary transition-colors duration-300">
                <ThumbsUp className="h-3 w-3" />
                Helpful
              </button>
            </div>
          </div>
        ))}
      </div>

      {sorted.length > initialCount && (
        <div className="text-center pt-2">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="gap-2 px-6"
          >
            {showAll ? (
              <>Show Less <ChevronUp className="h-4 w-4" /></>
            ) : (
              <>Show All {sorted.length} Reviews <ChevronDown className="h-4 w-4" /></>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
