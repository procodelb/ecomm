import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en-AE", "en-AU", "ar-AE"],
  defaultLocale: "en-AE",
  localePrefix: "as-needed",
  localeDetection: true,
});
