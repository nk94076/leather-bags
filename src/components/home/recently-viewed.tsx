"use client";

import { useEffect, useState } from "react";
import { useRecentlyViewedStore } from "@/lib/store/recently-viewed-store";
import { ProductCard } from "@/components/ui/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Container } from "@/components/ui/container";
import type { ProductCardData } from "@/types/catalog";

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const ids = useRecentlyViewedStore((s) => s.ids);
  const [products, setProducts] = useState<ProductCardData[]>([]);

  useEffect(() => {
    const filtered = ids.filter((id) => id !== excludeId);
    if (filtered.length === 0) {
      setProducts([]);
      return;
    }
    fetch(`/api/products/by-ids?ids=${filtered.join(",")}`)
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => setProducts([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(","), excludeId]);

  if (products.length === 0) return null;

  return (
    <section className="py-16">
      <Container>
        <SectionHeading eyebrow="Continue Browsing" title="Recently Viewed" align="left" className="mb-8" />
        <div className="-mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <div key={p.id} className="w-[64vw] shrink-0 snap-start sm:w-auto">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
