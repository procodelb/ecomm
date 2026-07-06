import { defineType, defineField } from "sanity";

export const videoShowcaseBlock = defineType({
  name: "videoShowcase",
  title: "Video Showcase",
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
      name: "videos",
      title: "Videos",
      type: "array",
      of: [
        {
          type: "object",
          name: "videoItem",
          fields: [
            { name: "url", title: "YouTube URL", type: "url" },
            { name: "thumbnail", title: "Thumbnail", type: "image", options: { hotspot: true } },
            { name: "title", title: "Title", type: "localizedString" },
            { name: "duration", title: "Duration (seconds)", type: "number" },
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
      return { title: title || "Video Showcase" };
    },
  },
});
