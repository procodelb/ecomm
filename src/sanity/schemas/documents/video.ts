import { defineType, defineField } from "sanity";

export const videoSchema = defineType({
  name: "video",
  title: "Video",
  type: "document",
  description: "Reusable video content for display across the site",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "localizedString",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: (doc) => (doc as { title?: { en?: string } })?.title?.en || "",
        maxLength: 96,
      },
    }),
    defineField({
      name: "url",
      title: "Video URL",
      type: "url",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "platform",
      title: "Platform",
      type: "string",
      options: {
        list: [
          { title: "YouTube", value: "youtube" },
          { title: "Vimeo", value: "vimeo" },
          { title: "MP4 (self-hosted)", value: "mp4" },
          { title: "TikTok", value: "tiktok" },
          { title: "Instagram", value: "instagram" },
        ],
      },
    }),
    defineField({
      name: "videoId",
      title: "Platform Video ID",
      type: "string",
      description: "YouTube/Vimeo video ID (extracted from URL)",
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "localizedText",
    }),
    defineField({
      name: "duration",
      title: "Duration (seconds)",
      type: "number",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "relatedProducts",
      title: "Related Products",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
    }),
    defineField({
      name: "autoplay",
      title: "Autoplay",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "loop",
      title: "Loop",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "title.en",
      subtitle: "platform",
      media: "thumbnail",
    },
  },
  orderings: [
    { title: "Featured First", name: "featured", by: [{ field: "featured", direction: "desc" }] },
  ],
});
