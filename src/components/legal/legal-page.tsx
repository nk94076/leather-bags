import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export interface LegalSection {
  heading: string;
  body: string;
}

export function LegalPage({
  title,
  updatedAt,
  sections,
}: {
  title: string;
  updatedAt?: string;
  sections: LegalSection[];
}) {
  return (
    <div className="py-10 sm:py-14">
      <Container className="max-w-3xl">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />
        <h1 className="mb-2 mt-4 font-display text-3xl text-brand-ink sm:text-4xl">{title}</h1>
        {updatedAt && <p className="mb-10 text-xs text-black/40">Last updated: {updatedAt}</p>}

        <div className="flex flex-col gap-8">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="mb-2 font-display text-xl text-brand-ink">{s.heading}</h2>
              <p className="text-sm leading-relaxed text-black/65">{s.body}</p>
            </section>
          ))}
        </div>
      </Container>
    </div>
  );
}
