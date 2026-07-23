"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface HeroSlide {
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  imageUrl: string;
}

export function Hero({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) return null;
  const slide = slides[index];

  return (
    <section className="relative h-[78vh] min-h-[520px] w-full overflow-hidden bg-brand-ink">
      {slides.map((s, i) => (
        <div
          key={i}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-out",
            i === index ? "opacity-100" : "opacity-0"
          )}
        >
          <Image
            src={s.imageUrl}
            alt={s.title}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
        </div>
      ))}

      <div className="relative z-10 flex h-full items-end pb-20 sm:items-center sm:pb-0">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div key={index} className="max-w-xl animate-fade-up">
            <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold">
              Corium Leather Co.
            </span>
            <h1 className="font-display text-4xl leading-[1.1] text-white sm:text-5xl lg:text-6xl">
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p className="mt-5 max-w-md text-base text-white/80 sm:text-lg">{slide.subtitle}</p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={slide.ctaUrl ?? "/shop"}
                className="inline-flex items-center justify-center rounded-full bg-brand-primary px-8 py-4 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-brand-primary-dark hover:shadow-luxury"
              >
                {slide.ctaLabel ?? "Shop Now"}
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-8 py-4 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-white hover:text-brand-ink"
              >
                Explore Collection
              </Link>
            </div>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === index ? "w-8 bg-brand-gold" : "w-4 bg-white/40 hover:bg-white/70"
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
