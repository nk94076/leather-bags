import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { getCmsPage } from "@/lib/data/cms";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ContactForm } from "@/components/contact/contact-form";
import { siteConfig } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage("contact-us");
  return {
    title: page?.metaTitle ?? "Contact Us",
    description: page?.metaDesc ?? "Get in touch with the Corium Leather Co. team.",
    alternates: { canonical: `${siteConfig.url}/contact-us` },
  };
}

export default async function ContactUsPage() {
  const page = await getCmsPage("contact-us");
  const content = (page?.content as { intro?: string; hours?: string }) ?? {};

  return (
    <div className="py-10 sm:py-14">
      <Container>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact Us" }]} />
        <h1 className="mb-3 mt-4 font-display text-3xl text-brand-ink sm:text-4xl">Get In Touch</h1>
        <p className="mb-10 max-w-xl text-sm text-black/60">
          {content.intro ?? "Have a question? We'd love to hear from you."}
        </p>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <ContactCard icon={Phone} label="Call Us" value={siteConfig.phone} href={`tel:${siteConfig.phone}`} />
            <ContactCard icon={Mail} label="Email Us" value={siteConfig.email} href={`mailto:${siteConfig.email}`} />
            <ContactCard icon={MapPin} label="Visit Us" value={siteConfig.address} />
            <ContactCard icon={Clock} label="Business Hours" value={content.hours ?? "Monday – Saturday, 9:30 AM – 6:30 PM IST"} />
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-6 sm:p-8 lg:col-span-3">
            <h2 className="mb-6 font-display text-xl text-brand-ink">Send Us a Message</h2>
            <ContactForm />
          </div>
        </div>
      </Container>
    </div>
  );
}

function ContactCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-4 rounded-2xl border border-black/5 bg-white p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-cream text-brand-primary">
        <Icon size={18} />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-black/40">{label}</p>
        <p className="mt-0.5 text-sm text-brand-ink">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href}>{content}</a> : content;
}
