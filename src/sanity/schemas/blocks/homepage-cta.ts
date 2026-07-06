import { defineType, defineField } from "sanity";

export const homepageCta = defineType({
  name: "homepageCta",
  title: "CTA Section",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "localizedString",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "localizedText",
    }),
    defineField({
      name: "buttonText",
      title: "Button Text",
      type: "localizedString",
    }),
    defineField({
      name: "buttonLink",
      title: "Button Link",
      type: "string",
    }),
    defineField({
      name: "buttonVariant",
      title: "Button Style",
      type: "string",
      options: {
        list: [
          { title: "Cyan (Primary)", value: "primary" },
          { title: "Gold", value: "gold" },
          { title: "Outline", value: "outline" },
        ],
      },
      initialValue: "gold",
    }),
    defineField({
      name: "backgroundImage",
      title: "Background Image",
      type: "image",
      options: { hotspot: true },
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
      return { title: title || "CTA Section" };
    },
  },
});
