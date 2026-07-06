import type { ComponentType } from "react";
import { HeroSection } from "./hero-section";
import { ThreeDShowcase } from "./three-d-showcase";
import { FeaturedCollections } from "./featured-collections";
import { BenefitsSection } from "./benefits-section";
import { VideoShowcase } from "./video-showcase";
import { ReviewsCarousel } from "./reviews-carousel";
import { InstagramFeed } from "./instagram-feed";
import { FaqSection } from "./faq-section";
import { NewsletterSection } from "./newsletter-section";
import { ProductStorytelling } from "./product-storytelling";
import { TrustBadges } from "./trust-badges";
import { AnimatedFooter } from "./animated-footer";

type Section = Record<string, unknown> & { _type: string };
type SanityBlock = { _type: "block"; children?: { text: string }[] };

type SectionRendererProps = {
  locale: string;
  sections: (Section | SanityBlock)[];
  includeFooter?: boolean;
};

const sectionComponents: Record<string, ComponentType<any>> = {
  homepageHero: HeroSection,
  threeDShowcase: ThreeDShowcase,
  featuredCollections: FeaturedCollections,
  benefitsSection: BenefitsSection,
  videoShowcase: VideoShowcase,
  reviewsCarousel: ReviewsCarousel,
  instagramFeed: InstagramFeed,
  faqSection: FaqSection,
  newsletterSection: NewsletterSection,
  productStorytelling: ProductStorytelling,
  trustBadges: TrustBadges,
  animatedFooter: AnimatedFooter,
};

function renderBlockContent(block: SanityBlock) {
  const text = block.children?.map((c) => c.text).join("") || "";
  return <p key={text.slice(0, 20)} className="text-muted-foreground">{text}</p>;
}

export function SectionRenderer({ locale, sections, includeFooter = true }: SectionRendererProps) {
  const sectionElements = sections.map((section, i) => {
    if (section._type === "block" || section._type === "blockContent") {
      return renderBlockContent(section as SanityBlock);
    }

    const Component = sectionComponents[section._type];
    if (!Component) return null;

    return (
      <Component key={`${section._type}-${i}`} {...section} locale={locale} />
    );
  });

  return (
    <>
      {sectionElements}
      {includeFooter && <AnimatedFooter locale={locale} />}
    </>
  );
}
