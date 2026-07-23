import { Gem, Hammer, ShieldCheck, Truck, RefreshCw, Headphones, Star, Award, Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const ICONS: Record<string, typeof Gem> = {
  Gem,
  Hammer,
  ShieldCheck,
  Truck,
  RefreshCw,
  Headphones,
  Star,
  Award,
  Clock,
};

export interface WhyChooseUsItem {
  icon: string;
  title: string;
  text: string;
}

export function WhyChooseUs({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle?: string | null;
  items: WhyChooseUsItem[];
}) {
  return (
    <section className="bg-white py-16 sm:py-20">
      <Container>
        <SectionHeading eyebrow="Our Promise" title={title} description={subtitle ?? undefined} />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const Icon = ICONS[item.icon] ?? Gem;
            return (
              <div
                key={i}
                className="group flex flex-col items-start gap-4 rounded-2xl border border-black/5 p-7 transition hover:-translate-y-1 hover:shadow-luxury"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-cream text-brand-primary transition group-hover:bg-brand-primary group-hover:text-white">
                  <Icon size={24} />
                </span>
                <h3 className="font-display text-lg text-brand-ink">{item.title}</h3>
                <p className="text-sm text-black/60">{item.text}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
