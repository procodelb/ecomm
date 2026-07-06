import { groq } from "next-sanity";

const productFields = groq`
  _id,
  _type,
  "slug": slug.current,
  title,
  shortDescription,
  sku,
  supplierSku,
  barcode,
  price,
  comparePrice,
  costPrice,
  taxable,
  taxRate,
  images[]{
    "url": image.asset->url,
    alt,
    caption
  },
  videos[]{
    url,
    platform,
    "thumbnail": thumbnail.asset->url,
    title,
    autoplay,
    loop
  },
  models3d[]{
    url,
    format,
    "thumbnail": thumbnail.asset->url,
    fileSize,
    autoRotate,
    arEnabled
  },
  "supplier": supplier->{ _id, name, code, country },
  category->{ _id, "slug": slug.current, title },
  subcategory,
  tags,
  featured,
  hasVariants,
  variantOptions,
  "variants": variants[]->{
    _id,
    title,
    sku,
    barcode,
    attributes,
    price,
    comparePrice,
    "images": images[]{ "url": image.asset->url, alt },
    availability,
    weightKg,
    isActive
  },
  seo,
  schemaProductType,
  availability,
  certifications[]{
    name,
    customName,
    certificateUrl,
    issuingBody,
    issuedDate,
    expiryDate
  },
  weightKg,
  dimensionsCm,
  material,
  color,
  ageRating,
  warnings,
  countryOfOrigin,
  hsCode,
  msdsRequired,
  msdsUrl,
  metadata
`;

export const productsQuery = groq`*[_type == "product"] | order(title.en asc) { ${productFields} }`;

export const productBySlugQuery = groq`*[_type == "product" && slug.current == $slug][0] { ${productFields} }`;

export const featuredProductsQuery = groq`*[_type == "product" && featured == true] { ${productFields} }`;

export const productsByCategoryQuery = groq`*[_type == "product" && category->slug.current == $categorySlug] { ${productFields} }`;

export const productVariantsQuery = groq`*[_type == "productVariant" && product._ref == $productId && isActive == true] | order(sortOrder asc) {
  _id,
  title,
  sku,
  barcode,
  attributes,
  price,
  comparePrice,
  costPrice,
  "images": images[]{ "url": image.asset->url, alt },
  models3d[],
  availability,
  weightKg,
  dimensionsCm,
  isActive
}`;

export const relatedProductsQuery = groq`*[_type == "product" && _id != $productId && category._ref == $categoryId] | order(_createdAt desc) [0...4] { ${productFields} }`;
