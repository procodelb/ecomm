import { defineType, defineField } from "sanity";

export const faqGroup = defineType({
  name: "faqGroup",
  title: "FAQ Group",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Group Title",
      type: "localizedString",
      description: "e.g. 'Shipping' or 'الدفع'",
    }),
    defineField({
      name: "faqs",
      title: "FAQs",
      type: "array",
      of: [
        {
          type: "object",
          name: "faqItem",
          fields: [
            { name: "question", title: "Question", type: "localizedString", validation: (rule) => rule.required() },
            { name: "answer", title: "Answer", type: "localizedBlockContent" },
            {
              name: "category",
              title: "Category",
              type: "string",
              options: {
                list: [
                  { title: "Shipping", value: "shipping" },
                  { title: "Payment", value: "payment" },
                  { title: "Returns", value: "returns" },
                  { title: "Product", value: "product" },
                  { title: "Safety", value: "safety" },
                  { title: "General", value: "general" },
                ],
              },
            },
          ],
          preview: {
            select: { title: "question.en" },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "title.en" },
    prepare({ title }: { title?: string }) {
      return { title: title || "FAQ Group" };
    },
  },
});

export const faqSchema = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  description: "Standalone FAQ document for structured data / dedicated page",
  fields: [
    defineField({
      name: "title",
      title: "Internal Title",
      type: "string",
      description: "e.g. 'Shipping FAQs'",
    }),
    defineField({
      name: "groups",
      title: "FAQ Groups",
      type: "array",
      of: [{ type: "faqGroup" }],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
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
    select: { title: "title" },
  },
});
