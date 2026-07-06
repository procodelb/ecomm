import { defineType, defineField } from "sanity";

export const featuredCollectionsBlock = defineType({
  name: "featuredCollections",
  title: "Featured Collections",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Section Title",
      type: "localizedString",
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "localizedString",
    }),
    defineField({
      name: "collections",
      title: "Collections",
      type: "array",
      of: [
        {
          type: "object",
          name: "collection",
          fields: [
            { name: "title", title: "Title", type: "localizedString" },
            { name: "description", title: "Description", type: "localizedText" },
            { name: "image", title: "Image", type: "image", options: { hotspot: true } },
            { name: "link", title: "Link", type: "string" },
          ],
          preview: {
            select: { title: "title.en" },
          },
        },
      ],
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
      return { title: title || "Featured Collections" };
    },
  },
});
