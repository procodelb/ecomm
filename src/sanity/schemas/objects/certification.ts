import { defineType, defineField } from "sanity";

export const certification = defineType({
  name: "certification",
  title: "Certification",
  type: "object",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      options: {
        list: [
          { title: "CE Marking", value: "ce" },
          { title: "ISO 9001", value: "iso_9001" },
          { title: "ASTM F963", value: "astm_f963" },
          { title: "EN 71", value: "en_71" },
          { title: "UKCA", value: "ukca" },
          { title: "RoHS", value: "rohs" },
          { title: "REACH", value: "reach" },
          { title: "CPSC", value: "cpsc" },
          { title: "FDA", value: "fda" },
          { title: "Other", value: "other" },
        ],
      },
    }),
    defineField({
      name: "customName",
      title: "Custom Name (if Other)",
      type: "string",
    }),
    defineField({
      name: "certificateUrl",
      title: "Certificate URL",
      type: "url",
    }),
    defineField({
      name: "issuingBody",
      title: "Issuing Body",
      type: "string",
    }),
    defineField({
      name: "issuedDate",
      title: "Issued Date",
      type: "date",
    }),
    defineField({
      name: "expiryDate",
      title: "Expiry Date",
      type: "date",
    }),
  ],
  preview: {
    select: { name: "name", custom: "customName" },
    prepare({ name, custom }: { name?: string; custom?: string }) {
      return { title: custom || name || "Certification" };
    },
  },
});
