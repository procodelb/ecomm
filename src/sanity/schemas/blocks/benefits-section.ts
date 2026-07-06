import { defineType, defineField } from "sanity";

export const benefitsSectionBlock = defineType({
  name: "benefitsSection",
  title: "Benefits Section",
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
      name: "benefits",
      title: "Benefits",
      type: "array",
      of: [
        {
          type: "object",
          name: "benefit",
          fields: [
            { name: "icon", title: "Icon (emoji/symbol)", type: "string" },
            { name: "title", title: "Title", type: "localizedString" },
            { name: "description", title: "Description", type: "localizedText" },
            { name: "stat", title: "Statistic Number", type: "number" },
            { name: "statLabel", title: "Stat Label", type: "localizedString" },
            { name: "suffix", title: "Stat Suffix", type: "string" },
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
      return { title: title || "Benefits" };
    },
  },
});
