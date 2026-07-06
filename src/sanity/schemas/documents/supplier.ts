import { defineType, defineField } from "sanity";

export const supplierSchema = defineType({
  name: "supplier",
  title: "Supplier",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Company Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "code",
      title: "Supplier Code",
      type: "string",
      description: "Short unique code (e.g. WAVERT, AQUAJET)",
      validation: (rule) => rule.required().uppercase(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "website",
      title: "Website",
      type: "url",
    }),
    defineField({
      name: "apiEndpoint",
      title: "API Endpoint",
      type: "url",
      description: "Base URL for supplier API",
    }),
    defineField({
      name: "apiDocs",
      title: "API Documentation URL",
      type: "url",
    }),
    defineField({
      name: "contactName",
      title: "Contact Name",
      type: "string",
    }),
    defineField({
      name: "contactEmail",
      title: "Contact Email",
      type: "string",
    }),
    defineField({
      name: "contactPhone",
      title: "Contact Phone",
      type: "string",
    }),
    defineField({
      name: "country",
      title: "Country",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "shippingMethods",
      title: "Shipping Methods",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Standard", value: "standard" },
          { title: "Express", value: "express" },
          { title: "Overnight", value: "overnight" },
          { title: "Freight", value: "freight" },
        ],
      },
    }),
    defineField({
      name: "currencies",
      title: "Supported Currencies",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "AED", value: "AED" },
          { title: "AUD", value: "AUD" },
          { title: "USD", value: "USD" },
          { title: "EUR", value: "EUR" },
          { title: "GBP", value: "GBP" },
        ],
      },
    }),
    defineField({
      name: "moq",
      title: "Minimum Order Quantity",
      type: "number",
      initialValue: 1,
    }),
    defineField({
      name: "leadTimeMin",
      title: "Lead Time (min days)",
      type: "number",
    }),
    defineField({
      name: "leadTimeMax",
      title: "Lead Time (max days)",
      type: "number",
    }),
    defineField({
      name: "returnsPolicy",
      title: "Returns Policy",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "msdsAvailable",
      title: "MSDS Available",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "msdsUrl",
      title: "MSDS Document URL",
      type: "url",
      hidden: ({ parent }) => !parent?.msdsAvailable,
    }),
    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      options: { list: [1, 2, 3, 4, 5] },
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Inactive", value: "inactive" },
          { title: "Suspended", value: "suspended" },
        ],
      },
      initialValue: "active",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "country", media: "logo" },
  },
  orderings: [
    { title: "Name", name: "name", by: [{ field: "name", direction: "asc" }] },
  ],
});
