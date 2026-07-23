import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FaqAccordion } from "@/components/faq/faq-accordion";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Find answers to common questions about orders, shipping, returns, payments and product care at Corium.",
};

export default async function FaqPage() {
  const faqs = await prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" } });

  const grouped = faqs.reduce<Record<string, typeof faqs>>((acc, item) => {
    acc[item.category] = acc[item.category] ?? [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <div className="py-10 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container className="max-w-3xl">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />
        <h1 className="mb-3 mt-4 font-display text-3xl text-brand-ink sm:text-4xl">Frequently Asked Questions</h1>
        <p className="mb-10 text-sm text-black/60">
          Can&apos;t find what you&apos;re looking for?{" "}
          <a href="/contact-us" className="text-brand-primary hover:underline">
            Contact our team
          </a>
          .
        </p>

        <div className="flex flex-col gap-10">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="mb-4 font-display text-xl text-brand-ink">{category}</h2>
              <FaqAccordion items={items} />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
