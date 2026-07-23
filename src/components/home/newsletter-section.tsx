import { Container } from "@/components/ui/container";
import { NewsletterForm } from "@/components/layout/newsletter-form";

export function NewsletterSection({ title, subtitle }: { title: string; subtitle?: string | null }) {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-gradient-to-br from-brand-secondary to-brand-ink px-6 py-16 text-center shadow-luxury">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">Stay in Touch</span>
          <h2 className="max-w-xl font-display text-3xl text-white sm:text-4xl">{title}</h2>
          {subtitle && <p className="max-w-md text-sm text-white/70">{subtitle}</p>}
          <NewsletterForm dark />
        </div>
      </Container>
    </section>
  );
}
