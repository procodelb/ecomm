export function getOgImageUrl(images: unknown[] | null | undefined): string | undefined {
  if (!images || !Array.isArray(images) || images.length === 0) return undefined;
  const first = images[0];
  if (typeof first === "string") return first;
  if (first && typeof first === "object") {
    const obj = first as Record<string, unknown>;
    const asset = obj.asset as Record<string, unknown> | undefined;
    return (obj.url as string) || (asset?.url as string) || undefined;
  }
  return undefined;
}
