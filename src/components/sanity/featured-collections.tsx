"use client";

import Link from "next/link";
import { useAnimateInView } from "@/hooks/use-animate-in-view";
import { Button, Heading, Text, Caption } from "@/components/ui";
import { SectionWrapper, Grid } from "@/components/shared/section-wrapper";
import { localize } from "./utils";

type Collection = {
  _key?: string;
  title?: { en?: string; ar?: string };
  description?: { en?: string; ar?: string };
  image?: string;
  link?: string;
  gradient?: string;
};

type Props = {
  locale: string;
  title?: { en?: string; ar?: string };
  subtitle?: { en?: string; ar?: string };
  collections?: Collection[];
};

const defaultCollections: Collection[] = [
  { title: { en: "Jet Skis" }, description: { en: "High-performance watercraft for adrenaline seekers" }, gradient: "from-blue-900/30 via-cyan-900/10 to-transparent" },
  { title: { en: "E-Surfboards" }, description: { en: "Electric hydrofoil boards for the ultimate ride" }, gradient: "from-primary/15 via-blue-900/10 to-transparent" },
  { title: { en: "Jet Boards" }, description: { en: "Premium carbon-fiber jet propulsion boards" }, gradient: "from-gold/10 via-amber-900/10 to-transparent" },
  { title: { en: "Accessories" }, description: { en: "Essential add-ons for the complete experience" }, gradient: "from-purple-900/20 via-pink-900/10 to-transparent" },
];

export function FeaturedCollections({ locale, title, subtitle, collections = defaultCollections }: Props) {
  const headingRef = useAnimateInView<HTMLDivElement>();

  return (
    <SectionWrapper className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-[0.02]">
        <div className="absolute top-1/3 left-0 w-96 h-96 rounded-full bg-primary blur-[200px]" />
      </div>
      <div ref={headingRef} className="text-center mb-14">
        <Caption className="mb-3 text-gold tracking-[0.15em] uppercase">
          {localize(locale, subtitle) || "Explore Our Range"}
        </Caption>
        <Heading as="h2">
          {localize(locale, title) || "Featured Collections"}
        </Heading>
      </div>
      <Grid cols={2}>
        {collections.map((col, i) => (
          <CollectionCard key={col._key || i} collection={col} locale={locale} index={i} />
        ))}
      </Grid>
    </SectionWrapper>
  );
}

function CollectionCard({ collection, locale, index }: { collection: Collection; locale: string; index: number }) {
  return (
    <Link href={collection.link || "/products"} className="group block">
      <div className="relative h-[300px] sm:h-[380px] rounded-2xl overflow-hidden border border-border bg-card group-hover:border-white/10 transition-all duration-500">
        <div className={`absolute inset-0 bg-gradient-to-br ${collection.gradient || "from-dark via-dark/95 to-dark"} opacity-60 group-hover:opacity-40 transition-opacity duration-700`} />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/10 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end h-full p-8 sm:p-10">
          <Heading as="h3" className="mb-2 text-white group-hover:translate-x-1 transition-transform duration-300">
            {localize(locale, collection.title)}
          </Heading>
          <Text size="sm" muted className="mb-6 max-w-xs text-white/60 group-hover:translate-x-1 transition-transform duration-300 delay-75">
            {localize(locale, collection.description)}
          </Text>
          <Button variant="outline" size="sm" className="self-start text-white/70 border-white/15 hover:border-primary/30 hover:text-primary">
            Explore Now
          </Button>
        </div>
      </div>
    </Link>
  );
}
