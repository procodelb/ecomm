import { defineType, defineField } from "sanity";

export const homepageTestimonials = defineType({
  name: "homepageTestimonials",
  title: "Testimonials Section",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Section Title",
      type: "localizedString",
    }),
    defineField({
      name: "testimonials",
      title: "Testimonials",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "quote", title: "Quote", type: "localizedText" },
            { name: "authorName", title: "Author Name", type: "localizedString" },
            { name: "authorTitle", title: "Author Title", type: "localizedString" },
            { name: "authorImage", title: "Author Image", type: "image", options: { hotspot: true } },
            { name: "rating", title: "Rating", type: "number", options: { list: [1, 2, 3, 4, 5] } },
          ],
          preview: {
            select: { title: "authorName.en", subtitle: "quote.en" },
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
      return { title: title || "Testimonials" };
    },
  },
});
