import { defineType, defineField } from "sanity";

export const reviewSchema = defineType({
  name: "review",
  title: "Product Review",
  type: "document",
  fields: [
    defineField({
      name: "product",
      title: "Product",
      type: "reference",
      to: [{ type: "product" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "variant",
      title: "Variant (optional)",
      type: "reference",
      to: [{ type: "productVariant" }],
    }),
    defineField({
      name: "customerName",
      title: "Customer Name",
      type: "string",
    }),
    defineField({
      name: "customerEmail",
      title: "Customer Email",
      type: "string",
    }),
    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      validation: (rule) => rule.required().min(1).max(5),
      options: { list: [1, 2, 3, 4, 5] },
    }),
    defineField({
      name: "title",
      title: "Review Title",
      type: "localizedString",
    }),
    defineField({
      name: "body",
      title: "Review Body",
      type: "localizedText",
    }),
    defineField({
      name: "pros",
      title: "Pros",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "cons",
      title: "Cons",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "mediaWithAlt" }],
    }),
    defineField({
      name: "videos",
      title: "Videos",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "url", title: "Video URL", type: "url" },
            { name: "platform", title: "Platform", type: "string", options: { list: [{ title: "YouTube", value: "youtube" }, { title: "TikTok", value: "tiktok" }] } },
          ],
        },
      ],
    }),
    defineField({
      name: "verifiedPurchase",
      title: "Verified Purchase",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "orderReference",
      title: "Order Reference",
      type: "string",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Approved", value: "approved" },
          { title: "Rejected", value: "rejected" },
          { title: "Flagged", value: "flagged" },
        ],
      },
      initialValue: "pending",
    }),
    defineField({
      name: "moderationNote",
      title: "Moderation Note",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "helpfulCount",
      title: "Helpful Votes",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: "title.en",
      subtitle: "customerName",
      rating: "rating",
      media: "images.0.image",
    },
    prepare({ title, subtitle, rating }: { title?: string; subtitle?: string; rating?: number }) {
      return {
        title: title || "Review",
        subtitle: `${subtitle || "Anonymous"} — ${"★".repeat(rating || 0)}${"☆".repeat(5 - (rating || 0))}`,
      };
    },
  },
  orderings: [
    { title: "Rating", name: "rating", by: [{ field: "rating", direction: "desc" }] },
    { title: "Newest", name: "created", by: [{ field: "_createdAt", direction: "desc" }] },
  ],
});
