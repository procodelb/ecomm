import { defineType, defineField } from "sanity";

export const homepageFeatured = defineType({
  name: "homepageFeatured",
  title: "Featured Products Section",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Section Title",
      type: "localizedString",
    }),
    defineField({
      name: "subtitle",
      title: "Section Subtitle",
      type: "localizedString",
    }),
    defineField({
      name: "products",
      title: "Featured Products",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
      validation: (rule) => rule.max(12),
    }),
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      options: {
        list: [
          { title: "Grid (3 columns)", value: "grid-3" },
          { title: "Grid (4 columns)", value: "grid-4" },
          { title: "Carousel", value: "carousel" },
          { title: "List", value: "list" },
        ],
      },
      initialValue: "grid-3",
    }),
    defineField({
      name: "backgroundColor",
      title: "Background Color",
      type: "string",
      options: {
        list: [
          { title: "White", value: "white" },
          { title: "Dark", value: "dark" },
          { title: "Gold Tint", value: "gold" },
          { title: "Cyan Tint", value: "cyan" },
        ],
      },
      initialValue: "white",
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
      return { title: title || "Featured Products" };
    },
  },
});
