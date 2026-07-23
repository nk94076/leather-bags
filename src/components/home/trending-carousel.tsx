"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCard } from "@/components/ui/product-card";
import type { ProductCardData } from "@/types/catalog";

export function TrendingCarousel({
  title,
  subtitle,
  products,
}: {
  title: string;
  subtitle?: string | null;
  products: ProductCardData[];
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", dragFree: true, slidesToScroll: 1 });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect).on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  if (products.length === 0) return null;

  return (
    <section className="bg-brand-cream-dark/50 py-16 sm:py-20">
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Trending" title={title} description={subtitle ?? undefined} align="left" className="mb-0" />
          <div className="flex gap-2">
            <button
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canPrev}
              aria-label="Previous"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white transition hover:bg-brand-cream disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canNext}
              aria-label="Next"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white transition hover:bg-brand-cream disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="-ml-5 flex">
            {products.map((p) => (
              <div key={p.id} className="w-[64vw] shrink-0 pl-5 sm:w-[38vw] md:w-[28vw] lg:w-[23vw]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
