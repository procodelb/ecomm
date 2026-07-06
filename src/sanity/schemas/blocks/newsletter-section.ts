import { defineType, defineField } from "sanity";

export const newsletterSectionBlock = defineType({
  name: "newsletterSection",
  title: "Newsletter Section",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "localizedString",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "localizedText",
    }),
    defineField({
      name: "placeholder",
      title: "Input Placeholder",
      type: "localizedString",
    }),
    defineField({
      name: "buttonText",
      title: "Button Text",
      type: "localizedString",
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
      return { title: title || "Newsletter" };
    },
  },
});
