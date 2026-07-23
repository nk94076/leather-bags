import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCmsPage } from "@/lib/data/cms";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { LinkButton } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage("about-us");
  return {
    title: page?.metaTitle ?? "About Us",
    description: page?.metaDesc ?? "Learn about Corium Leather Co.",
  };
}

interface AboutContent {
  hero: { title: string; subtitle: string };
  sections: { heading: string; body: string }[];
  stats: { label: string; value: string }[];
}

export default async function AboutUsPage() {
  const page = await getCmsPage("about-us");
  if (!page) notFound();
  const content = page.content as AboutContent;

  return (
    <div>
      <div className="bg-brand-ink py-16 text-center sm:py-24">
        <Container>
          <Breadcrumbs dark items={[{ label: "Home", href: "/" }, { label: "About Us" }]} />
          <h1 className="mx-auto mt-6 max-w-2xl font-display text-4xl text-white sm:text-5xl">{content.hero.title}</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/70 sm:text-base">{content.hero.subtitle}</p>
        </Container>
      </div>

      <Container className="py-14 sm:py-20">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 rounded-2xl bg-brand-cream p-8 sm:grid-cols-4">
          {content.stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl text-brand-primary sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-black/50">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 flex max-w-3xl flex-col gap-10">
          {content.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="mb-3 font-display text-2xl text-brand-ink">{s.heading}</h2>
              <p className="text-sm leading-relaxed text-black/65">{s.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <h3 className="font-display text-2xl text-brand-ink">Explore the Collection</h3>
          <LinkButton href="/shop">Shop Now</LinkButton>
        </div>
      </Container>
    </div>
  );
}
