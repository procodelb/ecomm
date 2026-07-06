import { defineType, defineField } from "sanity";

export const availability = defineType({
  name: "availability",
  title: "Availability",
  type: "object",
  fields: [
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "In Stock", value: "in_stock" },
          { title: "Out of Stock", value: "out_of_stock" },
          { title: "Pre-Order", value: "pre_order" },
          { title: "Backorder", value: "backorder" },
          { title: "Discontinued", value: "discontinued" },
          { title: "Coming Soon", value: "coming_soon" },
        ],
      },
      initialValue: "in_stock",
    }),
    defineField({
      name: "estimatedRestock",
      title: "Estimated Restock Date",
      type: "date",
      hidden: ({ parent }) => parent?.status !== "out_of_stock" && parent?.status !== "backorder",
    }),
    defineField({
      name: "stockCount",
      title: "Stock Count",
      type: "number",
      hidden: ({ parent }) => parent?.status !== "in_stock" && parent?.status !== "pre_order",
    }),
    defineField({
      name: "allowBackorder",
      title: "Allow Backorder",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "maxPerOrder",
      title: "Max Per Order",
      type: "number",
      description: "Leave empty for unlimited",
    }),
    defineField({
      name: "leadTime",
      title: "Lead Time",
      type: "string",
      description: "e.g. '2-3 business days'",
    }),
  ],
});
