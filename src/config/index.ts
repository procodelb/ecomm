export const siteConfig = {
  name: "Ecom Store",
  description: "Multi-region e-commerce platform.",
  url: "https://ecomm-store.com",
  locales: ["en-AE", "en-AU", "ar-AE"] as const,
  defaultLocale: "en-AE" as const,
};

export const localeConfigs = {
  "en-AE": {
    locale: "en-AE",
    currency: "AED" as const,
    currencySymbol: "د.إ",
    country: "AE" as const,
    language: "en",
    region: "UAE",
    timezone: "Asia/Dubai",
    localeCode: "en-AE",
    taxRate: 0.05,
    shippingZones: [
      {
        name: "Dubai",
        regions: ["Dubai", "Sharjah", "Ajman"],
        rate: 10,
        freeThreshold: 200,
        estimatedDays: [1, 2] as [number, number],
      },
      {
        name: "Abu Dhabi",
        regions: ["Abu Dhabi", "Al Ain"],
        rate: 15,
        freeThreshold: 250,
        estimatedDays: [1, 3] as [number, number],
      },
      {
        name: "Other Emirates",
        regions: ["Ras Al Khaimah", "Fujairah", "Umm Al Quwain"],
        rate: 25,
        freeThreshold: 300,
        estimatedDays: [2, 5] as [number, number],
      },
    ],
  },
  "en-AU": {
    locale: "en-AU",
    currency: "AUD" as const,
    currencySymbol: "A$",
    country: "AU" as const,
    language: "en",
    region: "Australia",
    timezone: "Australia/Sydney",
    localeCode: "en-AU",
    taxRate: 0.10,
    shippingZones: [
      {
        name: "Sydney Metro",
        regions: ["Sydney", "Newcastle", "Wollongong"],
        rate: 12,
        freeThreshold: 150,
        estimatedDays: [1, 2] as [number, number],
      },
      {
        name: "Melbourne Metro",
        regions: ["Melbourne", "Geelong"],
        rate: 12,
        freeThreshold: 150,
        estimatedDays: [1, 2] as [number, number],
      },
      {
        name: "Regional Australia",
        regions: ["Brisbane", "Perth", "Adelaide", "Hobart", "Darwin", "Canberra"],
        rate: 20,
        freeThreshold: 200,
        estimatedDays: [2, 5] as [number, number],
      },
    ],
  },
  "ar-AE": {
    locale: "ar-AE",
    currency: "AED" as const,
    currencySymbol: "د.إ",
    country: "AE" as const,
    language: "ar",
    region: "UAE",
    timezone: "Asia/Dubai",
    localeCode: "ar-AE",
    taxRate: 0.05,
    shippingZones: [
      {
        name: "دبي",
        regions: ["دبي", "الشارقة", "عجمان"],
        rate: 10,
        freeThreshold: 200,
        estimatedDays: [1, 2] as [number, number],
      },
      {
        name: "أبوظبي",
        regions: ["أبوظبي", "العين"],
        rate: 15,
        freeThreshold: 250,
        estimatedDays: [1, 3] as [number, number],
      },
      {
        name: "الإمارات الأخرى",
        regions: ["رأس الخيمة", "الفجيرة", "أم القيوين"],
        rate: 25,
        freeThreshold: 300,
        estimatedDays: [2, 5] as [number, number],
      },
    ],
  },
} as const;

export type LocaleKey = keyof typeof localeConfigs;
