import { defineType, defineField } from "sanity";

export const homepageHero = defineType({
  name: "homepageHero",
  title: "Hero Section",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "localizedString",
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "localizedString",
    }),
    defineField({
      name: "ctaText",
      title: "CTA Button Text",
      type: "localizedString",
    }),
    defineField({
      name: "ctaLink",
      title: "CTA Link",
      type: "string",
      description: "e.g. /products or /en-AE/products",
    }),
    defineField({
      name: "secondaryCtaText",
      title: "Secondary CTA Text",
      type: "localizedString",
    }),
    defineField({
      name: "secondaryCtaLink",
      title: "Secondary CTA Link",
      type: "string",
    }),
    defineField({
      name: "backgroundImage",
      title: "Background Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "backgroundVideo",
      title: "Background Video URL",
      type: "url",
      description: "MP4 video URL (overrides background image if set)",
    }),
    defineField({
      name: "threeDScene",
      title: "3D Scene URL",
      type: "url",
      description: "Spline or Three.js scene URL for interactive background",
    }),
    defineField({
      name: "overlayOpacity",
      title: "Overlay Opacity",
      type: "number",
      options: { list: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9] },
      initialValue: 0.3,
    }),
    defineField({
      name: "textAlign",
      title: "Text Alignment",
      type: "string",
      options: {
        list: [
          { title: "Left", value: "left" },
          { title: "Center", value: "center" },
          { title: "Right", value: "right" },
        ],
      },
      initialValue: "center",
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
    prepare({ title }: { title?: string }) {
      return { title: title || "Hero Section" };
    },
  },
});
