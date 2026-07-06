import { Heading, Text, Caption, Card, CardContent } from "@/components/ui";
import { SectionWrapper, Grid } from "@/components/shared/section-wrapper";
import { localize } from "./utils";

type Testimonial = {
  quote?: { en?: string; ar?: string };
  authorName?: { en?: string; ar?: string };
  authorTitle?: { en?: string; ar?: string };
  authorImage?: { asset?: { _ref?: string }; url?: string };
  rating?: number;
};

type TestimonialsSectionProps = {
  locale: string;
  title?: { en?: string; ar?: string };
  testimonials?: Testimonial[];
};

export function TestimonialsSection({
  locale,
  title,
  testimonials = [],
}: TestimonialsSectionProps) {
  if (testimonials.length === 0) return null;

  return (
    <SectionWrapper id="testimonials">
      <Caption className="text-center mb-2 text-gold">What Our Customers Say</Caption>
      <Heading as="h2" className="text-center mb-12">
        {localize(locale, title) || "Testimonials"}
      </Heading>
      <Grid cols={3}>
        {testimonials.map((t, i) => (
          <Card key={i} hover glass>
            <CardContent className="text-center">
              <Text size="sm" muted className="mb-4 italic">
                &ldquo;{localize(locale, t.quote)}&rdquo;
              </Text>
              <div className="flex items-center justify-center gap-1 mb-2">
                {Array.from({ length: t.rating || 5 }, (_, j) => (
                  <span key={j} className="text-gold text-sm">★</span>
                ))}
              </div>
              <Text className="font-semibold">{localize(locale, t.authorName)}</Text>
              {t.authorTitle && (
                <Text size="xs" muted>{localize(locale, t.authorTitle)}</Text>
              )}
            </CardContent>
          </Card>
        ))}
      </Grid>
    </SectionWrapper>
  );
}
