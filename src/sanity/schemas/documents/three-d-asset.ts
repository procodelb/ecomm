import { defineType, defineField } from "sanity";

export const threeDAssetSchema = defineType({
  name: "threeDAsset",
  title: "3D Asset",
  type: "document",
  description: "Reusable 3D model asset for product views, hero scenes, and AR",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "modelUrl",
      title: "Model URL",
      type: "url",
      validation: (rule) => rule.required(),
      description: "GLB, GLTF, USDZ, or Spline public URL",
    }),
    defineField({
      name: "format",
      title: "Format",
      type: "string",
      options: {
        list: [
          { title: "GLB", value: "glb" },
          { title: "GLTF", value: "gltf" },
          { title: "USDZ", value: "usdz" },
          { title: "Spline", value: "spline" },
          { title: "FBX", value: "fbx" },
          { title: "OBJ", value: "obj" },
        ],
      },
    }),
    defineField({
      name: "fileSize",
      title: "File Size (MB)",
      type: "number",
    }),
    defineField({
      name: "thumbnail",
      title: "Preview Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "arQuickLook",
      title: "AR Quick Look Enabled",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "arUrl",
      title: "AR USDZ URL (iOS)",
      type: "url",
      hidden: ({ parent }) => !parent?.arQuickLook,
    }),
    defineField({
      name: "cameraSettings",
      title: "Default Camera",
      type: "object",
      fields: [
        { name: "positionX", title: "X", type: "number", initialValue: 0 },
        { name: "positionY", title: "Y", type: "number", initialValue: 2 },
        { name: "positionZ", title: "Z", type: "number", initialValue: 5 },
        { name: "autoRotate", title: "Auto Rotate", type: "boolean", initialValue: true },
        { name: "rotationSpeed", title: "Rotation Speed", type: "number", initialValue: 2 },
      ],
    }),
    defineField({
      name: "environment",
      title: "Environment",
      type: "string",
      options: {
        list: [
          { title: "Studio", value: "studio" },
          { title: "Sunset", value: "sunset" },
          { title: "Warehouse", value: "warehouse" },
          { title: "Beach", value: "beach" },
          { title: "Neon", value: "neon" },
        ],
      },
      initialValue: "studio",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "format",
      media: "thumbnail",
    },
  },
});
