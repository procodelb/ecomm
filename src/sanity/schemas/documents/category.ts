import { defineType, defineField } from "sanity";

export const categorySchema = defineType({
  name: "category",
  title: "Category",
  type: "document",
  groups: [
    { name: "details", title: "Details" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "localizedString",
      group: "details",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "details",
      options: {
        source: (doc) => (doc as { title?: { en?: string } })?.title?.en || "",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "localizedText",
      group: "details",
    }),
    defineField({
      name: "image",
      title: "Category Image",
      type: "mediaWithAlt",
      group: "details",
    }),
    defineField({
      name: "parent",
      title: "Parent Category",
      type: "reference",
      group: "details",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "sortOrder",
      title: "Sort Order",
      type: "number",
      group: "details",
      initialValue: 0,
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
      media: "image.image",
    },
  },
  orderings: [
    { title: "Sort Order", name: "sortOrder", by: [{ field: "sortOrder", direction: "asc" }] },
    { title: "Title", name: "title", by: [{ field: "title.en", direction: "asc" }] },
  ],
});
