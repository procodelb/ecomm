import { defineType, defineField } from "sanity";

export const instagramFeedBlock = defineType({
  name: "instagramFeed",
  title: "Instagram Feed",
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
      name: "posts",
      title: "Instagram Posts",
      type: "array",
      of: [
        {
          type: "object",
          name: "post",
          fields: [
            { name: "image", title: "Image", type: "image", options: { hotspot: true } },
            { name: "likes", title: "Likes", type: "number" },
            { name: "caption", title: "Caption", type: "localizedString" },
            { name: "url", title: "Post URL", type: "url" },
          ],
          preview: {
            select: { title: "caption.en" },
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
      return { title: title || "Instagram Feed" };
    },
  },
});
