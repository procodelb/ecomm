import { defineType, defineField } from "sanity";

export const productVariantSchema = defineType({
  name: "productVariant",
  title: "Product Variant",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Variant Title",
      type: "string",
      description: "e.g. 'Ocean Blue / 120cm'",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "product",
      title: "Parent Product",
      type: "reference",
      to: [{ type: "product" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sku",
      title: "SKU",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "barcode",
      title: "Barcode (UPC/EAN)",
      type: "string",
    }),
    defineField({
      name: "attributes",
      title: "Attributes",
      type: "object",
      fields: [
        { name: "color", title: "Color", type: "string" },
        { name: "size", title: "Size", type: "string" },
        { name: "material", title: "Material", type: "string" },
        { name: "capacity", title: "Capacity (kg/lbs)", type: "string" },
        { name: "dimensions", title: "Dimensions", type: "string" },
      ],
    }),
    defineField({
      name: "price",
      title: "Price by Country",
      type: "priceByCountry",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "comparePrice",
      title: "Compare-at Price by Country",
      type: "priceByCountry",
      description: "Original / crossed-out price",
    }),
    defineField({
      name: "costPrice",
      title: "Cost Price by Country",
      type: "priceByCountry",
      description: "Your cost (for margin calculation)",
    }),
    defineField({
      name: "availability",
      title: "Availability",
      type: "availability",
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "mediaWithAlt" }],
    }),
    defineField({
      name: "models3d",
      title: "3D Models",
      type: "array",
      of: [{ type: "threeDModel" }],
    }),
    defineField({
      name: "weightKg",
      title: "Weight (kg)",
      type: "number",
    }),
    defineField({
      name: "dimensionsCm",
      title: "Dimensions (cm)",
      type: "object",
      fields: [
        { name: "length", title: "Length", type: "number" },
        { name: "width", title: "Width", type: "number" },
        { name: "height", title: "Height", type: "number" },
      ],
    }),
    defineField({
      name: "isActive",
      title: "Active",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "sortOrder",
      title: "Sort Order",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "sku",
      media: "images.0.image",
      productTitle: "product.title",
    },
    prepare({ title, subtitle, media, productTitle }: Record<string, any>) {
      return {
        title: title || "Untitled Variant",
        subtitle: productTitle ? `${subtitle || ""} — ${productTitle}` : subtitle,
        media,
      };
    },
  },
  orderings: [
    { title: "Sort Order", name: "sortOrder", by: [{ field: "sortOrder", direction: "asc" }] },
  ],
});
