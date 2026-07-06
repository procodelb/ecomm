export function localize(locale: string, value?: { en?: string; ar?: string } | null): string | undefined {
  if (!value) return undefined;
  const lang = locale.startsWith("ar") ? "ar" : "en";
  return value[lang as keyof typeof value] || value.en || value.ar;
}
