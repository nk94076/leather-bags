import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { InstagramIcon, FacebookIcon, TwitterIcon } from "@/components/icons/social-icons";
import { Container } from "@/components/ui/container";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { siteConfig } from "@/lib/site-config";

interface FooterCategory {
  name: string;
  slug: string;
}

export function Footer({ categories }: { categories: FooterCategory[] }) {
  return (
    <footer className="mt-24 bg-brand-ink text-brand-cream">
      <Container className="py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <span className="font-display text-2xl tracking-[0.15em]">{siteConfig.name}</span>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-cream/70">
              {siteConfig.description}
            </p>
            <div className="mt-6 flex flex-col gap-2 text-sm text-brand-cream/70">
              <span className="flex items-center gap-2">
                <MapPin size={15} className="text-brand-gold" /> {siteConfig.address}
              </span>
              <a href={`tel:${siteConfig.phone}`} className="flex items-center gap-2 hover:text-white">
                <Phone size={15} className="text-brand-gold" /> {siteConfig.phone}
              </a>
              <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-2 hover:text-white">
                <Mail size={15} className="text-brand-gold" /> {siteConfig.email}
              </a>
            </div>
            <div className="mt-6 flex items-center gap-3">
              {[
                { icon: InstagramIcon, href: siteConfig.social.instagram },
                { icon: FacebookIcon, href: siteConfig.social.facebook },
                { icon: TwitterIcon, href: siteConfig.social.twitter },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition hover:border-brand-gold hover:text-brand-gold"
                >
                  <Icon className="h-[15px] w-[15px]" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-brand-gold">Company</h3>
            <ul className="flex flex-col gap-3 text-sm text-brand-cream/70">
              <li><Link href="/about-us" className="hover:text-white">About Us</Link></li>
              <li><Link href="/contact-us" className="hover:text-white">Contact Us</Link></li>
              <li><Link href="/shop" className="hover:text-white">Shop All</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQs</Link></li>
              <li><Link href="/track-order" className="hover:text-white">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-brand-gold">Categories</h3>
            <ul className="flex flex-col gap-3 text-sm text-brand-cream/70">
              {categories.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link href={`/shop/${c.slug}`} className="hover:text-white">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-brand-gold">Policies</h3>
            <ul className="flex flex-col gap-3 text-sm text-brand-cream/70">
              <li><Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:text-white">Terms &amp; Conditions</Link></li>
              <li><Link href="/shipping-return-policy" className="hover:text-white">Shipping &amp; Returns</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-10 lg:flex-row lg:items-center">
          <div>
            <h3 className="mb-2 font-display text-lg">Join the Corium Circle</h3>
            <p className="text-sm text-brand-cream/60">Early access to new collections, private sales &amp; craft stories.</p>
          </div>
          <NewsletterForm dark />
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-brand-cream/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.fullName}. All rights reserved.</p>
          <div className="flex items-center gap-3">
            {["Visa", "Mastercard", "UPI", "RuPay", "Amex"].map((p) => (
              <span key={p} className="rounded border border-white/15 px-2 py-1 text-[10px] font-semibold tracking-wide">
                {p}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
