import { defineType, defineField } from "sanity";

export const blogPostSchema = defineType({
  name: "blogPost",
  title: "Blog Post",
  type: "document",
  groups: [
    { name: "content", title: "Content" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "localizedString",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: {
        source: (doc) => (doc as { title?: { en?: string } })?.title?.en || "",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "mediaWithAlt",
      group: "content",
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "localizedText",
      group: "content",
      description: "Short summary for cards and listings",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "localizedBlockContent",
      group: "content",
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Buying Guide", value: "buying-guide" },
          { title: "Reviews", value: "reviews" },
          { title: "News", value: "news" },
          { title: "Safety", value: "safety" },
          { title: "Tutorials", value: "tutorials" },
        ],
      },
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      group: "content",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "featured",
      title: "Featured Post",
      type: "boolean",
      group: "content",
      initialValue: false,
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    select: {
      title: "title.en",
      subtitle: "publishedAt",
      media: "coverImage.image",
    },
  },
  orderings: [
    { title: "Published", name: "publishedAt", by: [{ field: "publishedAt", direction: "desc" }] },
  ],
});
