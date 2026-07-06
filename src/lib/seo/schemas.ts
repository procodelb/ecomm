import { getSiteUrl, SITE_NAME } from "./site-config";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: getSiteUrl(),
    logo: `${getSiteUrl()}/images/logo.png`,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+971-4-123-4567",
        contactType: "customer service",
        areaServed: ["AE", "AU"],
        availableLanguage: ["English", "Arabic"],
      },
    ],
    sameAs: [
      `${getSiteUrl()}/facebook`,
      `${getSiteUrl()}/instagram`,
      `${getSiteUrl()}/twitter`,
    ],
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: SITE_NAME,
    image: `${getSiteUrl()}/images/og-default.jpg`,
    url: getSiteUrl(),
    telephone: "+971-4-123-4567",
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Dubai Marina",
      addressLocality: "Dubai",
      addressCountry: "AE",
    },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Monday", opens: "09:00", closes: "21:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Tuesday", opens: "09:00", closes: "21:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Wednesday", opens: "09:00", closes: "21:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Thursday", opens: "09:00", closes: "21:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Friday", opens: "10:00", closes: "22:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "10:00", closes: "22:00" },
    ],
  };
}

type BreadcrumbItem = { name: string; url: string };

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

type ProductSchemaOpts = {
  name: string;
  description?: string;
  sku: string;
  mpn?: string;
  image: string[];
  brand?: string;
  offers: {
    price: number;
    currency: string;
    availability: string;
    url?: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
  };
  reviews?: Array<{
    author: string;
    datePublished: string;
    reviewBody?: string;
    reviewRating: { ratingValue: number };
  }>;
};

export function productSchema(opts: ProductSchemaOpts) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.name,
    description: opts.description,
    sku: opts.sku,
    image: opts.image,
    offers: {
      "@type": "Offer",
      price: opts.offers.price,
      priceCurrency: opts.offers.currency,
      availability: opts.offers.availability,
      url: opts.offers.url,
    },
  };
  if (opts.mpn) schema.mpn = opts.mpn;
  if (opts.brand) schema.brand = { "@type": "Brand", name: opts.brand };
  if (opts.aggregateRating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: opts.aggregateRating.ratingValue,
      reviewCount: opts.aggregateRating.reviewCount,
      bestRating: opts.aggregateRating.bestRating ?? 5,
    };
  }
  if (opts.reviews && opts.reviews.length > 0) {
    schema.review = opts.reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      datePublished: r.datePublished,
      reviewBody: r.reviewBody,
      reviewRating: { "@type": "Rating", ratingValue: r.reviewRating.ratingValue },
    }));
  }
  return schema;
}

type FaqItem = { question: string; answer: string };

export function faqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

type ArticleSchemaOpts = {
  headline: string;
  description?: string;
  image: string[];
  datePublished: string;
  dateModified?: string;
  author: string;
};

export function articleSchema(opts: ArticleSchemaOpts) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    image: opts.image,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    author: { "@type": "Person", name: opts.author },
    publisher: { "@type": "Organization", name: SITE_NAME },
  };
}
