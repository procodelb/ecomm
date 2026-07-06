import Link from "next/link";
import { Button, Heading, Text, Caption, Card, CardContent, CardFooter } from "@/components/ui";
import { SectionWrapper, Grid } from "@/components/shared/section-wrapper";
import { ProductImage } from "@/lib/seo/image";
import { localize } from "./utils";

type FeaturedProduct = {
  _id: string;
  slug: string;
  title: { en?: string; ar?: string };
  price?: { aed?: number; aud?: number };
  comparePrice?: { aed?: number; aud?: number };
  image?: { url: string; alt?: string };
  category?: { _id: string; slug: string; title: { en?: string; ar?: string } };
};

type FeaturedSectionProps = {
  locale: string;
  title?: { en?: string; ar?: string };
  subtitle?: { en?: string; ar?: string };
  products?: FeaturedProduct[];
  layout?: "grid-3" | "grid-4" | "carousel" | "list";
  backgroundColor?: "white" | "dark" | "gold" | "cyan";
};

const colsMap: Record<string, 2 | 3 | 4> = {
  "grid-3": 3,
  "grid-4": 4,
  carousel: 3,
  list: 2,
};

export function FeaturedSection({
  locale,
  title,
  subtitle,
  products = [],
  layout = "grid-3",
  backgroundColor = "dark",
}: FeaturedSectionProps) {
  if (products.length === 0) return null;

  return (
    <SectionWrapper
      id="featured"
      {...(backgroundColor === "gold" ? { gold: true } : {})}
      {...(backgroundColor === "cyan" ? { gradient: true } : {})}
      {...(backgroundColor === "dark" ? {} : {})}
    >
      <Caption className="text-center mb-2 text-primary">
        {localize(locale, subtitle) || "Curated Selection"}
      </Caption>
      <Heading as="h2" className="text-center mb-12">
        {localize(locale, title) || "Featured Products"}
      </Heading>
      <Grid cols={colsMap[layout] || 3}>
        {products.map((p) => (
          <Card key={p._id} hover glass className="text-center p-8">
            <div className="mb-6 flex items-center justify-center h-32">
              {p.image?.url ? (
                <ProductImage src={p.image.url} alt={p.image.alt || ""} width={160} height={128} className="w-auto max-h-32 object-contain" />
              ) : (
                <span className="text-6xl text-primary/20 font-heading">◈</span>
              )}
            </div>
            <CardContent>
              {p.category?.title && (
                <Caption className="mb-2">
                  {localize(locale, p.category.title)}
                </Caption>
              )}
              <Heading as="h3" className="mb-2">{localize(locale, p.title)}</Heading>
              <Heading as="h4" gradient="primary">
                AED {p.price?.aed?.toLocaleString() || "—"}
              </Heading>
            </CardContent>
            <CardFooter className="justify-center mt-6">
              <Link href={`/products/${p.slug}`}>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </Grid>
    </SectionWrapper>
  );
}

