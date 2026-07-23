"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { Quote } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Rating } from "@/components/ui/rating";
import { placeholderUrl } from "@/lib/placeholder";

export interface ReviewSlide {
  id: string;
  authorName: string;
  rating: number;
  title: string;
  comment: string;
  productName: string;
}

export function ReviewsSlider({ title, subtitle, reviews }: { title: string; subtitle?: string | null; reviews: ReviewSlide[] }) {
  const [emblaRef] = useEmblaCarousel({ align: "start", loop: true });

  if (reviews.length === 0) return null;

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading eyebrow="Testimonials" title={title} description={subtitle ?? undefined} />
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="-ml-5 flex">
            {reviews.map((r) => (
              <div key={r.id} className="w-[85vw] shrink-0 pl-5 sm:w-[45vw] lg:w-[31vw]">
                <div className="flex h-full flex-col gap-4 rounded-2xl border border-black/5 bg-white p-7 shadow-sm">
                  <Quote size={22} className="text-brand-gold" />
                  <Rating value={r.rating} />
                  <p className="text-sm leading-relaxed text-black/70">&ldquo;{r.comment}&rdquo;</p>
                  <div className="mt-auto flex items-center gap-3 pt-2">
                    <Image
                      src={placeholderUrl("avatar", r.id, { label: r.authorName, w: 44 })}
                      alt={r.authorName}
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-brand-ink">{r.authorName}</p>
                      <p className="text-xs text-black/50">Purchased {r.productName}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
