import { defineType, defineField } from "sanity";

export const threeDModel = defineType({
  name: "threeDModel",
  title: "3D Model",
  type: "object",
  fields: [
    defineField({
      name: "url",
      title: "Model URL",
      type: "url",
      description: "GLB, GLTF, USDZ, or Spline URL",
      validation: (rule) => rule.uri({ allowRelative: true }),
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
      name: "thumbnail",
      title: "Preview Thumbnail",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "fileSize",
      title: "File Size (MB)",
      type: "number",
    }),
    defineField({
      name: "autoRotate",
      title: "Auto Rotate",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "cameraPosition",
      title: "Camera Position",
      type: "object",
      fields: [
        { name: "x", title: "X", type: "number" },
        { name: "y", title: "Y", type: "number" },
        { name: "z", title: "Z", type: "number" },
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
    }),
    defineField({
      name: "arEnabled",
      title: "AR Quick Look Enabled",
      type: "boolean",
      initialValue: false,
      description: "Enable iOS AR Quick Look for USDZ files",
    }),
  ],
});
