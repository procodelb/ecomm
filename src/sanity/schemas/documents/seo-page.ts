import { defineType, defineField } from "sanity";

export const seoPageSchema = defineType({
  name: "seoPage",
  title: "SEO Page",
  type: "document",
  description: "Full static pages with SEO metadata — e.g. About, Contact, Shipping, Privacy",
  fields: [
    defineField({
      name: "title",
      title: "Page Title",
      type: "localizedString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: (doc) => (doc as { title?: { en?: string } })?.title?.en || "",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sections",
      title: "Page Sections",
      type: "array",
      of: [
        { type: "blockContent" },
        { type: "mediaWithAlt" },
        { type: "faqGroup" },
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
    defineField({
      name: "locale",
      title: "Locale",
      type: "string",
      options: {
        list: [
          { title: "All", value: "all" },
          { title: "UAE (English)", value: "en-AE" },
          { title: "Australia", value: "en-AU" },
          { title: "UAE (Arabic)", value: "ar-AE" },
        ],
      },
      initialValue: "all",
    }),
  ],
  preview: {
    select: { title: "title.en" },
  },
});
