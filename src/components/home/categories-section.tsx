import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { CategoryCard } from "@/components/ui/category-card";

export function CategoriesSection({
  title,
  subtitle,
  categories,
}: {
  title: string;
  subtitle?: string | null;
  categories: { name: string; slug: string; imageUrl: string }[];
}) {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading eyebrow="Collections" title={title} description={subtitle ?? undefined} />
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0 md:grid-cols-4 lg:grid-cols-5">
          {categories.map((c) => (
            <CategoryCard key={c.slug} name={c.name} slug={c.slug} imageUrl={c.imageUrl} />
          ))}
        </div>
      </Container>
    </section>
  );
}
