"use client";

import { useEffect } from "react";
import { useRecentlyViewedStore } from "@/lib/store/recently-viewed-store";

export function TrackRecentlyViewed({ productId }: { productId: string }) {
  const add = useRecentlyViewedStore((s) => s.add);
  useEffect(() => {
    add(productId);
  }, [productId, add]);
  return null;
}
