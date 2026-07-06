"use client";

import Image from "next/image";
import { useState } from "react";

type ProductImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function ProductImage({ src, alt, width, height, fill, className, priority, sizes }: ProductImageProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-white/5 text-xs text-white/20 ${className ?? ""}`}
        style={fill ? { position: "absolute", inset: 0 } : { width, height }}>
        No Image
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt || ""}
      width={fill ? undefined : (width ?? 400)}
      height={fill ? undefined : (height ?? 400)}
      fill={fill}
      className={className}
      priority={priority}
      sizes={sizes || "(max-width: 768px) 100vw, 400px"}
      onError={() => setError(true)}
    />
  );
}

export function getImageAlt(productTitle: string, variant?: string): string {
  const base = productTitle || "Product";
  return variant ? `${base} - ${variant}` : base;
}

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
