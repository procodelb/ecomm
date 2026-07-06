import { defineType, defineField } from "sanity";

export const homepageSchema = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  description: "Modular homepage built from reusable sections. One document per locale.",
  groups: [
    { name: "sections", title: "Sections" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Internal Title",
      type: "string",
      description: "e.g. 'Homepage — UAE English'",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "locale",
      title: "Locale",
      type: "string",
      options: {
        list: [
          { title: "UAE (English)", value: "en-AE" },
          { title: "Australia", value: "en-AU" },
          { title: "UAE (Arabic)", value: "ar-AE" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sections",
      title: "Page Sections",
      type: "array",
      group: "sections",
      of: [
        { type: "homepageHero" },
        { type: "homepageFeatured" },
        { type: "homepageCta" },
        { type: "homepageTestimonials" },
        { type: "threeDShowcase" },
        { type: "featuredCollections" },
        { type: "benefitsSection" },
        { type: "videoShowcase" },
        { type: "reviewsCarousel" },
        { type: "instagramFeed" },
        { type: "faqSection" },
        { type: "newsletterSection" },
        { type: "blockContent" },
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "locale" },
  },
});
