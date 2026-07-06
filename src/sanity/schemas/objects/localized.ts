import { defineType, defineField } from "sanity";

export const localizedString = defineType({
  name: "localizedString",
  title: "Localized String",
  type: "object",
  fields: [
    defineField({ name: "en", title: "English", type: "string" }),
    defineField({ name: "ar", title: "العربية", type: "string" }),
  ],
});

export const localizedText = defineType({
  name: "localizedText",
  title: "Localized Text",
  type: "object",
  fields: [
    defineField({ name: "en", title: "English", type: "text", rows: 3 }),
    defineField({ name: "ar", title: "العربية", type: "text", rows: 3 }),
  ],
});

export const localizedBlockContent = defineType({
  name: "localizedBlockContent",
  title: "Localized Rich Content",
  type: "object",
  fields: [
    defineField({
      name: "en",
      title: "English",
      type: "blockContent",
    }),
    defineField({
      name: "ar",
      title: "العربية",
      type: "blockContent",
    }),
  ],
});

export const priceByCountry = defineType({
  name: "priceByCountry",
  title: "Price by Country",
  type: "object",
  fields: [
    defineField({
      name: "aed",
      title: "AED (UAE)",
      type: "number",
      validation: (rule) => rule.min(0).precision(2),
    }),
    defineField({
      name: "aud",
      title: "AUD (Australia)",
      type: "number",
      validation: (rule) => rule.min(0).precision(2),
    }),
  ],
});
