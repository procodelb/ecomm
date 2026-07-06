import { defineType, defineField } from "sanity";

export const reviewsCarouselBlock = defineType({
  name: "reviewsCarousel",
  title: "Reviews Carousel",
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
      name: "reviews",
      title: "Reviews",
      type: "array",
      of: [
        {
          type: "object",
          name: "reviewItem",
          fields: [
            { name: "quote", title: "Quote", type: "localizedText" },
            { name: "authorName", title: "Author Name", type: "localizedString" },
            { name: "authorTitle", title: "Author Title", type: "localizedString" },
            { name: "avatar", title: "Avatar", type: "image", options: { hotspot: true } },
            { name: "rating", title: "Rating", type: "number", options: { list: [1, 2, 3, 4, 5] } },
          ],
          preview: {
            select: { title: "authorName.en" },
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
      return { title: title || "Reviews Carousel" };
    },
  },
});
