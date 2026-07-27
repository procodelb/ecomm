"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

export function HtmlAttributes() {
  const locale = useLocale();

  useEffect(() => {
    const html = document.documentElement;
    html.lang = locale;
    html.dir = locale === "ar-AE" ? "rtl" : "ltr";
  }, [locale]);

  return null;
}
