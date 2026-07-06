export const analyticsConfig = {
  ga4: {
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "",
    apiSecret: process.env.GA_API_SECRET || "",
    enabled: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  },
  meta: {
    pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
    accessToken: process.env.META_CONVERSIONS_ACCESS_TOKEN || "",
    enabled: !!process.env.NEXT_PUBLIC_META_PIXEL_ID,
  },
  tiktok: {
    pixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "",
    enabled: !!process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID,
  },
  clarity: {
    projectId: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "",
    enabled: !!process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
  },
  hotjar: {
    siteId: process.env.NEXT_PUBLIC_HOTJAR_SITE_ID || "",
    version: process.env.NEXT_PUBLIC_HOTJAR_VERSION || "6",
    enabled: !!process.env.NEXT_PUBLIC_HOTJAR_SITE_ID,
  },
} as const;

export type AnalyticsConfig = typeof analyticsConfig;
