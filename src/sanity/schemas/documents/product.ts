import { defineType, defineField } from "sanity";

export const productSchema = defineType({
  name: "product",
  title: "Product",
  type: "document",
  groups: [
    { name: "details", title: "Details" },
    { name: "pricing", title: "Pricing" },
    { name: "media", title: "Media" },
    { name: "supplier", title: "Supplier" },
    { name: "variants", title: "Variants" },
    { name: "seo", title: "SEO & Schema" },
    { name: "specs", title: "Specifications" },
  ],
  fields: [
    // ── Details ──────────────────────────────────────────────
    defineField({
      name: "title",
      title: "Product Name",
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
      name: "shortDescription",
      title: "Short Description",
      type: "localizedText",
      group: "details",
      description: "Shown in product cards and search results",
    }),
    defineField({
      name: "description",
      title: "Full Description",
      type: "localizedBlockContent",
      group: "details",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      group: "details",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "subcategory",
      title: "Subcategory",
      type: "string",
      group: "details",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      group: "details",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "featured",
      title: "Featured Product",
      type: "boolean",
      group: "details",
      initialValue: false,
    }),

    // ── Pricing ─────────────────────────────────────────────
    defineField({
      name: "price",
      title: "Base Price by Country",
      type: "priceByCountry",
      group: "pricing",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "comparePrice",
      title: "Compare-at Price by Country",
      type: "priceByCountry",
      group: "pricing",
      description: "Original / crossed-out price for sales",
    }),
    defineField({
      name: "costPrice",
      title: "Cost Price by Country",
      type: "priceByCountry",
      group: "pricing",
      description: "Your cost per unit (private)",
    }),
    defineField({
      name: "taxable",
      title: "Taxable",
      type: "boolean",
      group: "pricing",
      initialValue: true,
    }),
    defineField({
      name: "taxRate",
      title: "Tax Rate (%)",
      type: "number",
      group: "pricing",
      description: "Override default tax rate",
    }),

    // ── Media ───────────────────────────────────────────────
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      group: "media",
      of: [{ type: "mediaWithAlt" }],
      options: { layout: "grid" },
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "videos",
      title: "Videos",
      type: "array",
      group: "media",
      of: [
        {
          type: "object",
          name: "productVideo",
          fields: [
            { name: "url", title: "Video URL", type: "url", validation: (rule) => rule.required() },
            {
              name: "platform",
              title: "Platform",
              type: "string",
              options: {
                list: [
                  { title: "YouTube", value: "youtube" },
                  { title: "Vimeo", value: "vimeo" },
                  { title: "MP4", value: "mp4" },
                  { title: "TikTok", value: "tiktok" },
                ],
              },
            },
            { name: "thumbnail", title: "Thumbnail", type: "image", options: { hotspot: true } },
            { name: "title", title: "Title", type: "localizedString" },
            { name: "autoplay", title: "Autoplay", type: "boolean", initialValue: false },
            { name: "loop", title: "Loop", type: "boolean", initialValue: false },
          ],
          preview: {
            select: { title: "title.en", media: "thumbnail" },
          },
        },
      ],
    }),
    defineField({
      name: "models3d",
      title: "3D Models",
      type: "array",
      group: "media",
      of: [{ type: "threeDModel" }],
      description: "GLB, USDZ, or Spline models for interactive product views",
    }),

    // ── Supplier ────────────────────────────────────────────
    defineField({
      name: "supplier",
      title: "Supplier",
      type: "reference",
      group: "supplier",
      to: [{ type: "supplier" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "supplierSku",
      title: "Supplier SKU",
      type: "string",
      group: "supplier",
    }),
    defineField({
      name: "sku",
      title: "Internal SKU",
      type: "string",
      group: "supplier",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "barcode",
      title: "Barcode (UPC/EAN)",
      type: "string",
      group: "supplier",
    }),
    defineField({
      name: "supplierPrice",
      title: "Supplier Price",
      type: "priceByCountry",
      group: "supplier",
      description: "What the supplier charges you",
    }),
    defineField({
      name: "moq",
      title: "Minimum Order Qty",
      type: "number",
      group: "supplier",
    }),
    defineField({
      name: "leadTime",
      title: "Lead Time",
      type: "string",
      group: "supplier",
      description: "e.g. '7-10 business days'",
    }),
    defineField({
      name: "countryOfOrigin",
      title: "Country of Origin",
      type: "string",
      group: "supplier",
    }),
    defineField({
      name: "hsCode",
      title: "HS Tariff Code",
      type: "string",
      group: "supplier",
    }),

    // ── Variants ────────────────────────────────────────────
    defineField({
      name: "hasVariants",
      title: "This product has variants",
      type: "boolean",
      group: "variants",
      initialValue: false,
      description: "Enable if this product comes in colors, sizes, etc.",
    }),
    defineField({
      name: "variantOptions",
      title: "Variant Options (labels)",
      type: "object",
      group: "variants",
      fields: [
        { name: "color", title: "Color options", type: "array", of: [{ type: "string" }], options: { layout: "tags" } },
        { name: "size", title: "Size options", type: "array", of: [{ type: "string" }], options: { layout: "tags" } },
        { name: "material", title: "Material options", type: "array", of: [{ type: "string" }], options: { layout: "tags" } },
      ],
      hidden: ({ parent }) => !parent?.hasVariants,
    }),
    defineField({
      name: "variants",
      title: "Variants",
      type: "array",
      group: "variants",
      of: [{ type: "reference", to: [{ type: "productVariant" }] }],
      hidden: ({ parent }) => !parent?.hasVariants,
    }),

    // ── SEO & Schema ────────────────────────────────────────
    defineField({
      name: "seo",
      title: "SEO & Metadata",
      type: "seo",
      group: "seo",
    }),
    defineField({
      name: "schemaProductType",
      title: "Schema.org Product Type",
      type: "string",
      group: "seo",
      options: {
        list: [
          { title: "Product (default)", value: "Product" },
          { title: "Watercraft", value: "https://schema.org/Watercraft" },
          { title: "SportsActivity", value: "https://schema.org/SportsActivity" },
          { title: "Vehicle", value: "https://schema.org/Vehicle" },
        ],
      },
      initialValue: "Product",
    }),

    // ── Specifications ──────────────────────────────────────
    defineField({
      name: "availability",
      title: "Availability",
      type: "availability",
      group: "specs",
    }),
    defineField({
      name: "certifications",
      title: "Certifications & Compliance",
      type: "array",
      group: "specs",
      of: [{ type: "certification" }],
    }),
    defineField({
      name: "weightKg",
      title: "Weight (kg)",
      type: "number",
      group: "specs",
    }),
    defineField({
      name: "dimensionsCm",
      title: "Dimensions (cm)",
      type: "object",
      group: "specs",
      fields: [
        { name: "length", title: "Length", type: "number" },
        { name: "width", title: "Width", type: "number" },
        { name: "height", title: "Height", type: "number" },
      ],
    }),
    defineField({
      name: "material",
      title: "Material",
      type: "string",
      group: "specs",
    }),
    defineField({
      name: "color",
      title: "Color",
      type: "string",
      group: "specs",
    }),
    defineField({
      name: "ageRating",
      title: "Age Rating",
      type: "string",
      group: "specs",
      options: {
        list: [
          { title: "All Ages", value: "0+" },
          { title: "3+", value: "3+" },
          { title: "6+", value: "6+" },
          { title: "8+", value: "8+" },
          { title: "12+", value: "12+" },
          { title: "18+", value: "18+" },
        ],
      },
    }),
    defineField({
      name: "warnings",
      title: "Safety Warnings",
      type: "text",
      rows: 3,
      group: "specs",
    }),
    defineField({
      name: "msdsRequired",
      title: "MSDS Required",
      type: "boolean",
      group: "specs",
      initialValue: false,
    }),
    defineField({
      name: "msdsUrl",
      title: "MSDS Document URL",
      type: "url",
      group: "specs",
      hidden: ({ parent }) => !parent?.msdsRequired,
    }),
  ],
  preview: {
    select: {
      title: "title.en",
      subtitle: "sku",
      media: "images.0.image",
    },
    prepare({ title, subtitle, media }: Record<string, any>) {
      return {
        title: title || "Untitled Product",
        subtitle: subtitle || "",
        media,
      };
    },
  },
  orderings: [
    { title: "Title", name: "title", by: [{ field: "title.en", direction: "asc" }] },
    { title: "Created", name: "created", by: [{ field: "_createdAt", direction: "desc" }] },
    { title: "Featured First", name: "featured", by: [{ field: "featured", direction: "desc" }] },
  ],
});
