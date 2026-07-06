import { groq } from "next-sanity";

const seoFields = groq`
  seo {
    metaTitle,
    metaDescription,
    keywords,
    "ogImage": ogImage.asset->url,
    ogTitle,
    ogDescription,
    canonicalUrl,
    structuredData,
    noIndex
  }
`;

export const pageBySlugQuery = groq`*[_type == "seoPage" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  sections[]{
    ...
  },
  locale,
  ${seoFields}
}`;

export const siteSettingsQuery = groq`*[_type == "siteSettings"][0] {
  title,
  tagline,
  description,
  contactEmail,
  contactPhone,
  "logo": logo.asset->url,
  "logoDark": logoDark.asset->url,
  "favicon": favicon.asset->url,
  "ogImage": ogImage.asset->url,
  locales,
  defaultLocale,
  social,
  defaultSeo {
    metaTitle,
    metaDescription,
    "ogImage": ogImage.asset->url
  },
  headerScripts,
  footerScripts
}`;

export const homepageQuery = groq`*[_type == "homepage" && locale == $locale][0] {
  _id,
  title,
  locale,
  sections[]{
    ...,
    _type == "homepageHero" => {
      ...,
      "backgroundImage": backgroundImage.asset->url
    },
    _type == "homepageFeatured" => {
      ...,
      products[]->{
        _id,
        "slug": slug.current,
        title,
        price,
        comparePrice,
        "image": images[0]{ "url": image.asset->url, alt },
        category->{ _id, "slug": slug.current, title }
      }
    },
    _type == "homepageCta" => {
      ...,
      "backgroundImage": backgroundImage.asset->url
    }
  },
  ${seoFields}
}`;

export const blogPostsQuery = groq`*[_type == "blogPost"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  author,
  "coverImage": coverImage { "url": image.asset->url, alt, caption },
  excerpt,
  categories,
  tags,
  publishedAt,
  featured
}`;

export const blogPostBySlugQuery = groq`*[_type == "blogPost" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  author,
  "coverImage": coverImage { "url": image.asset->url, alt, caption },
  excerpt,
  body,
  categories,
  tags,
  publishedAt,
  featured,
  ${seoFields}
}`;

export const faqQuery = groq`*[_type == "faq" && ($locale == "all" || locale == $locale)][0] {
  _id,
  title,
  groups[]{
    title,
    faqs[]{
      question,
      answer,
      category
    }
  },
  ${seoFields}
}`;

export const reviewsByProductQuery = groq`*[_type == "review" && product._ref == $productId && status == "approved"] | order(_createdAt desc) {
  _id,
  customerName,
  rating,
  title,
  body,
  pros,
  cons,
  "images": images[]{ "url": image.asset->url, alt },
  verifiedPurchase,
  helpfulCount,
  _createdAt
}`;

export const videosQuery = groq`*[_type == "video"] | order(featured desc, _createdAt desc) {
  _id,
  title,
  "slug": slug.current,
  url,
  platform,
  videoId,
  "thumbnail": thumbnail.asset->url,
  description,
  duration,
  tags,
  featured,
  autoplay,
  loop
}`;

export const threeDAssetsQuery = groq`*[_type == "threeDAsset"] {
  _id,
  title,
  "slug": slug.current,
  modelUrl,
  format,
  fileSize,
  "thumbnail": thumbnail.asset->url,
  arQuickLook,
  arUrl,
  cameraSettings,
  environment,
  tags
}`;

export const suppliersQuery = groq`*[_type == "supplier" && status == "active"] {
  _id,
  name,
  code,
  "logo": logo.asset->url,
  description,
  country,
  shippingMethods,
  currencies,
  moq,
  leadTimeMin,
  leadTimeMax,
  rating
}`;
