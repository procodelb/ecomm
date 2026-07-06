"use client";

import { useEffect, useRef } from "react";

type Props = {
  productId: string;
  name: string;
  price: number;
  currency: string;
  category?: string;
};

export function ProductViewTracker({ productId, name, price, currency, category }: Props) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    import("@/lib/analytics/client").then(({ trackProductView }) => {
      trackProductView(productId, name, price, currency, category);
    });
  }, [productId, name, price, currency, category]);

  return null;
}
