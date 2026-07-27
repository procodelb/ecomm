"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Heading, Caption } from "@/components/ui";
import { ProductCard } from "@/components/ui/product-card";
import { ProductGrid } from "./product-grid";
import { ProductFilters } from "./product-filters";
import { ProductSort, type SortOption } from "./product-sort";
import { ProductsPagination } from "./products-pagination";
import { ProductsEmptyState } from "./products-empty-state";
import { Container } from "@/components/shared/section-wrapper";

interface SanityImage {
  url: string;
  alt: string | null;
}

interface SanityCategory {
  _id: string;
  slug: string;
  title: Record<string, string>;
}

interface SanityAvailability {
  status: string;
}

interface SanityProduct {
  _id: string;
  slug: string;
  title: Record<string, string>;
  shortDescription?: Record<string, string>;
  price: Record<string, number>;
  comparePrice?: Record<string, number>;
  images: SanityImage[];
  category: SanityCategory | null;
  tags: string[] | null;
  availability: SanityAvailability | null;
  featured: boolean | null;
}

interface FilteredProduct {
  _id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  price: number;
  comparePrice: number | null;
  image: string | undefined;
  category: SanityCategory | null;
  inStock: boolean;
  lowStock: boolean;
  badge: string | undefined;
  badgeVariant: "default" | "gold" | "outline" | undefined;
}

interface ProductsLayoutProps {
  products: SanityProduct[];
  locale: string;
  currency: string;
  className?: string;
}

const ITEMS_PER_PAGE = 12;
const DEFAULT_SORT: SortOption = "newest";

function processProducts(products: SanityProduct[], locale: string): FilteredProduct[] {
  return products.map((p) => {
    const lang = locale.startsWith("ar") ? "ar" : "en";
    const localizedTitle = p.title?.[lang] ?? p.title?.en ?? "";
    const price = p.price?.[locale.includes("AU") ? "aud" : "aed"] ?? 0;
    const comparePriceVal = p.comparePrice?.[locale.includes("AU") ? "aud" : "aed"] ?? null;
    const image = p.images?.[0]?.url;
    const status = p.availability?.status;
    const inStock = status === "in_stock" || status === "low_stock" || !status;
    const lowStock = status === "low_stock";

    let badge: string | undefined;
    let badgeVariant: "default" | "gold" | "outline" | undefined;
    if (p.featured) {
      badge = "Featured";
      badgeVariant = "gold";
    } else if (status === "coming_soon") {
      badge = "Coming Soon";
      badgeVariant = "outline";
    } else if (status === "out_of_stock") {
      badge = "Out of Stock";
      badgeVariant = "outline";
    }

    return {
      _id: p._id,
      slug: p.slug,
      title: localizedTitle,
      shortDescription: p.shortDescription?.[lang] ?? p.shortDescription?.en ?? undefined,
      price,
      comparePrice: comparePriceVal && comparePriceVal > 0 ? comparePriceVal : null,
      image,
      category: p.category,
      inStock,
      lowStock,
      badge,
      badgeVariant,
    };
  });
}

function sortProducts(products: FilteredProduct[], sort: SortOption): FilteredProduct[] {
  const sorted = [...products];
  switch (sort) {
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "name-asc":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "name-desc":
      sorted.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case "newest":
    default:
      break;
  }
  return sorted;
}

export function ProductsLayout({ products, locale, currency, className }: ProductsLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const processed = useMemo(() => processProducts(products, locale), [products, locale]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams?.get("category") ?? null,
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 99999]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>(DEFAULT_SORT);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const cat = searchParams?.get("category");
    if (cat !== selectedCategory) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Sync selected category from URL search params
      setSelectedCategory(cat ?? null);
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Sync from URL only on searchParams change
  }, [searchParams]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    processed.forEach((p) => {
      const slug = p.category?.slug;
      if (slug) counts[slug] = (counts[slug] || 0) + 1;
    });
    return counts;
  }, [processed]);

  const uniqueCategories = useMemo(() => {
    const seen = new Set<string>();
    return processed
      .filter((p) => p.category && !seen.has(p.category.slug) && seen.add(p.category.slug))
      .map((p) => ({
        slug: p.category!.slug,
        title: p.category!.title?.[locale.startsWith("ar") ? "ar" : "en"] ?? p.category!.slug,
        count: categoryCounts[p.category!.slug] || 0,
      }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [processed, categoryCounts, locale]);

  const filtered = useMemo(() => {
    let result = [...processed];

    if (selectedCategory) {
      result = result.filter((p) => p.category?.slug === selectedCategory);
    }

    if (priceRange[0] > 0 || priceRange[1] < 99999) {
      result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    }

    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    return result;
  }, [processed, selectedCategory, priceRange, inStockOnly]);

  const sorted = useMemo(() => sortProducts(filtered, sort), [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const hasActiveFilters = !!(
    selectedCategory ||
    priceRange[0] > 0 ||
    priceRange[1] < 99999 ||
    inStockOnly
  );

  const handleCategoryChange = useCallback(
    (slug: string | null) => {
      setSelectedCategory(slug);
      setPage(1);
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if (slug) params.set("category", slug);
      else params.delete("category");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  const handlePriceRangeChange = useCallback((range: [number, number]) => {
    setPriceRange(range);
    setPage(1);
  }, []);

  const handleInStockChange = useCallback((v: boolean) => {
    setInStockOnly(v);
    setPage(1);
  }, []);

  const handleClear = useCallback(() => {
    setSelectedCategory(null);
    setPriceRange([0, 99999]);
    setInStockOnly(false);
    setPage(1);
    setSort(DEFAULT_SORT);
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.delete("category");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const handlePageChange = useCallback((p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <main className={cn("min-h-screen pt-24 sm:pt-28 pb-16 sm:pb-24", className)}>
      <Container>
        {/* Hero */}
        <div className="text-center mb-8 sm:mb-12">
          <Caption className="mb-2 text-primary tracking-[0.15em] uppercase">
            Premium Collection
          </Caption>
          <Heading as="h1" className="mb-3">
            Explore Our Range
          </Heading>
          <p className="text-sm text-muted-foreground/70 max-w-xl mx-auto leading-relaxed">
            Handpicked luxury water toys and premium watercraft for the discerning enthusiast.
          </p>
        </div>

        {/* Mobile filter + sort bar */}
        <div className="flex items-center justify-between gap-3 mb-6 lg:hidden">
          <ProductFilters
            categories={uniqueCategories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            priceRange={priceRange}
            onPriceRangeChange={handlePriceRangeChange}
            inStockOnly={inStockOnly}
            onInStockChange={handleInStockChange}
            onClear={handleClear}
            hasActiveFilters={hasActiveFilters}
            totalResults={filtered.length}
          />
          <ProductSort
            value={sort}
            onChange={setSort}
            totalResults={filtered.length}
          />
        </div>

        <div className="flex gap-8 lg:gap-10">
          {/* Desktop sidebar */}
          <ProductFilters
            categories={uniqueCategories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            priceRange={priceRange}
            onPriceRangeChange={handlePriceRangeChange}
            inStockOnly={inStockOnly}
            onInStockChange={handleInStockChange}
            onClear={handleClear}
            hasActiveFilters={hasActiveFilters}
            totalResults={filtered.length}
            className="hidden lg:block"
          />

          <div className="flex-1 min-w-0">
            {/* Desktop sort bar */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <div />
              <ProductSort
                value={sort}
                onChange={setSort}
                totalResults={filtered.length}
              />
            </div>

            {/* Grid */}
            {paginated.length > 0 ? (
              <ProductGrid>
                {paginated.map((p) => (
                  <ProductCard
                    key={p._id}
                    title={p.title}
                    price={p.price}
                    currency={currency}
                    image={p.image}
                    href={`/products/${p.slug}`}
                    badge={p.badge}
                    badgeVariant={p.badgeVariant}
                    comparePrice={p.comparePrice ?? undefined}
                    inStock={p.inStock}
                    lowStock={p.lowStock}
                  />
                ))}
              </ProductGrid>
            ) : (
              <ProductsEmptyState onClear={handleClear} />
            )}

            {/* Pagination */}
            <ProductsPagination
              page={safePage}
              pages={totalPages}
              onPage={handlePageChange}
              className="mt-10 sm:mt-14"
            />
          </div>
        </div>
      </Container>
    </main>
  );
}
