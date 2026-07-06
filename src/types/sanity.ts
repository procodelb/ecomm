import type { SanityDocument } from "@sanity/client";
import type { SanityImageCrop, SanityImageHotspot } from "@sanity/image-url";

export interface SanityProduct extends SanityDocument {
  title: string;
  slug: { current: string };
  description: string;
  price: number;
  comparePrice?: number;
  images: SanityImage[];
  categories: SanityCategory[];
  variants: SanityProductVariant[];
  tags: string[];
  featured: boolean;
}

export interface SanityCategory extends SanityDocument {
  title: string;
  slug: { current: string };
  description?: string;
  image?: SanityImage;
  parent?: { _ref: string };
}

export interface SanityProductVariant {
  title: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  crop?: SanityImageCrop;
  hotspot?: SanityImageHotspot;
  alt?: string;
}

export interface SanityPage extends SanityDocument {
  title: string;
  slug: { current: string };
  content: unknown[];
  seo: {
    title: string;
    description: string;
    ogImage?: SanityImage;
  };
}

export interface SanitySiteSettings extends SanityDocument {
  title: string;
  description: string;
  logo?: SanityImage;
  favicon?: SanityImage;
  locales: string[];
  defaultLocale: string;
  social: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
}
