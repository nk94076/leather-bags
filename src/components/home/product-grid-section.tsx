import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCard } from "@/components/ui/product-card";
import type { ProductCardData } from "@/types/catalog";

export function ProductGridSection({
  eyebrow,
  title,
  subtitle,
  products,
  viewAllHref = "/shop",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string | null;
  products: ProductCardData[];
  viewAllHref?: string;
}) {
  if (products.length === 0) return null;
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} description={subtitle ?? undefined} />
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-2 rounded-full border border-brand-secondary/30 px-8 py-3 text-xs font-semibold uppercase tracking-wide text-brand-secondary transition hover:bg-brand-secondary hover:text-white"
          >
            View All
          </Link>
        </div>
      </Container>
    </section>
  );
}
