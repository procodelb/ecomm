import { defineType, defineField } from "sanity";

export const seoObject = defineType({
  name: "seo",
  title: "SEO & Metadata",
  type: "object",
  options: { collapsed: false },
  fields: [
    defineField({
      name: "metaTitle",
      title: "Meta Title",
      type: "string",
      description: "70 characters max",
      validation: (rule) => rule.max(70),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "text",
      rows: 2,
      description: "160 characters max",
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: "keywords",
      title: "Keywords",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "ogImage",
      title: "OG Image (social share)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "ogTitle",
      title: "OG Title (overrides meta title)",
      type: "string",
    }),
    defineField({
      name: "ogDescription",
      title: "OG Description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "canonicalUrl",
      title: "Canonical URL",
      type: "url",
    }),
    defineField({
      name: "structuredData",
      title: "Structured Data (JSON-LD)",
      type: "text",
      description: "Paste raw JSON-LD schema markup",
      rows: 6,
    }),
    defineField({
      name: "noIndex",
      title: "No Index",
      type: "boolean",
      initialValue: false,
    }),
  ],
});
