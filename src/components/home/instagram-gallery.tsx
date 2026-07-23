import Image from "next/image";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { InstagramIcon } from "@/components/icons/social-icons";
import { siteConfig } from "@/lib/site-config";

export function InstagramGallery({ title, subtitle, images }: { title: string; subtitle?: string | null; images: string[] }) {
  if (images.length === 0) return null;
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading eyebrow="@corium.leather" title={title} description={subtitle ?? undefined} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {images.map((src, i) => (
            <a
              key={i}
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-xl"
            >
              <Image src={src} alt="Corium on Instagram" fill sizes="200px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                <InstagramIcon className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
