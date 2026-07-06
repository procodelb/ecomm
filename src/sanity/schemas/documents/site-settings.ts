import { defineType, defineField } from "sanity";

export const siteSettingsSchema = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "general", title: "General" },
    { name: "branding", title: "Branding" },
    { name: "locales", title: "Locales" },
    { name: "social", title: "Social" },
    { name: "seo", title: "Default SEO" },
    { name: "scripts", title: "Scripts" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Site Title",
      type: "string",
      group: "general",
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "localizedString",
      group: "general",
    }),
    defineField({
      name: "description",
      title: "Site Description",
      type: "text",
      group: "general",
      rows: 2,
    }),
    defineField({
      name: "contactEmail",
      title: "Contact Email",
      type: "string",
      group: "general",
    }),
    defineField({
      name: "contactPhone",
      title: "Contact Phone",
      type: "string",
      group: "general",
    }),

    // Branding
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      group: "branding",
    }),
    defineField({
      name: "logoDark",
      title: "Logo (Dark Background Variant)",
      type: "image",
      group: "branding",
    }),
    defineField({
      name: "favicon",
      title: "Favicon",
      type: "image",
      group: "branding",
    }),
    defineField({
      name: "ogImage",
      title: "Default OG Image",
      type: "image",
      group: "branding",
      options: { hotspot: true },
    }),

    // Locales
    defineField({
      name: "locales",
      title: "Enabled Locales",
      type: "array",
      group: "locales",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "UAE (English)", value: "en-AE" },
          { title: "Australia", value: "en-AU" },
          { title: "UAE (Arabic)", value: "ar-AE" },
        ],
      },
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "defaultLocale",
      title: "Default Locale",
      type: "string",
      group: "locales",
      options: {
        list: [
          { title: "UAE (English)", value: "en-AE" },
          { title: "Australia", value: "en-AU" },
          { title: "UAE (Arabic)", value: "ar-AE" },
        ],
      },
    }),

    // Social
    defineField({
      name: "social",
      title: "Social Links",
      type: "object",
      group: "social",
      fields: [
        { name: "instagram", title: "Instagram URL", type: "url" },
        { name: "facebook", title: "Facebook URL", type: "url" },
        { name: "twitter", title: "X (Twitter) URL", type: "url" },
        { name: "tiktok", title: "TikTok URL", type: "url" },
        { name: "youtube", title: "YouTube URL", type: "url" },
        { name: "linkedin", title: "LinkedIn URL", type: "url" },
        { name: "snapchat", title: "Snapchat URL", type: "url" },
      ],
    }),

    // Default SEO
    defineField({
      name: "defaultSeo",
      title: "Default SEO",
      type: "seo",
      group: "seo",
    }),

    // Scripts
    defineField({
      name: "headerScripts",
      title: "Header Scripts",
      type: "text",
      group: "scripts",
      rows: 5,
      description: "Custom scripts injected into <head> (analytics, meta tags, etc.)",
    }),
    defineField({
      name: "footerScripts",
      title: "Footer Scripts",
      type: "text",
      group: "scripts",
      rows: 5,
      description: "Custom scripts injected before </body>",
    }),
  ],
  preview: {
    select: { title: "title" },
  },
});
