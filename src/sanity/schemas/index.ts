import type { SchemaTypeDefinition } from "sanity";

import {
  productSchema,
  productVariantSchema,
  supplierSchema,
  categorySchema,
  blogPostSchema,
  seoPageSchema,
  homepageSchema,
  faqSchema,
  reviewSchema,
  videoSchema,
  threeDAssetSchema,
  siteSettingsSchema,
  faqGroup,
} from "./documents";

import {
  seoObject,
  localizedString,
  localizedText,
  localizedBlockContent,
  priceByCountry,
  threeDModel,
  certification,
  mediaWithAlt,
  availability,
  blockContent,
} from "./objects";

import {
  homepageHero,
  homepageFeatured,
  homepageCta,
  homepageTestimonials,
  threeDShowcaseBlock,
  featuredCollectionsBlock,
  benefitsSectionBlock,
  videoShowcaseBlock,
  reviewsCarouselBlock,
  instagramFeedBlock,
  faqSectionBlock,
  newsletterSectionBlock,
} from "./blocks";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Documents
  productSchema,
  productVariantSchema,
  supplierSchema,
  categorySchema,
  blogPostSchema,
  seoPageSchema,
  homepageSchema,
  faqSchema,
  reviewSchema,
  videoSchema,
  threeDAssetSchema,
  siteSettingsSchema,

  // Objects used inline
  seoObject,
  localizedString,
  localizedText,
  localizedBlockContent,
  priceByCountry,
  threeDModel,
  certification,
  mediaWithAlt,
  availability,
  blockContent,
  faqGroup,

  // Blocks
  homepageHero,
  homepageFeatured,
  homepageCta,
  homepageTestimonials,
  threeDShowcaseBlock,
  featuredCollectionsBlock,
  benefitsSectionBlock,
  videoShowcaseBlock,
  reviewsCarouselBlock,
  instagramFeedBlock,
  faqSectionBlock,
  newsletterSectionBlock,
];
