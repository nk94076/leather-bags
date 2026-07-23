import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";

export interface PromoBanner {
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  imageUrl: string;
}

export function PromoBanners({ left, right }: { left?: PromoBanner; right?: PromoBanner }) {
  if (!left && !right) return null;
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[left, right].map(
            (b, i) =>
              b && (
                <Link
                  key={i}
                  href={b.ctaUrl ?? "/shop"}
                  className="group relative flex h-96 flex-col justify-end overflow-hidden rounded-2xl"
                >
                  <Image
                    src={b.imageUrl}
                    alt={b.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="relative p-8">
                    <h3 className="font-display text-2xl text-white sm:text-3xl">{b.title}</h3>
                    {b.subtitle && <p className="mt-2 max-w-xs text-sm text-white/80">{b.subtitle}</p>}
                    <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wide text-brand-ink transition group-hover:bg-brand-gold group-hover:text-white">
                      {b.ctaLabel ?? "Shop Now"}
                    </span>
                  </div>
                </Link>
              )
          )}
        </div>
      </Container>
    </section>
  );
}
