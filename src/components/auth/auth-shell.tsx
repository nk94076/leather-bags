import Link from "next/link";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/site-config";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100vh-160px)] grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-brand-ink lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary via-brand-ink to-black opacity-90" />
        <div className="relative flex h-full flex-col justify-between p-14 text-brand-cream">
          <Link href="/" className="font-display text-2xl tracking-[0.2em]">
            {siteConfig.name}
          </Link>
          <div>
            <p className="font-display text-4xl leading-tight">
              Leather that carries your story, one journey at a time.
            </p>
            <p className="mt-4 max-w-md text-sm text-brand-cream/60">
              Join thousands of customers who trust Corium for genuine, handcrafted leather goods built to last.
            </p>
          </div>
          <p className="text-xs text-brand-cream/40">© {new Date().getFullYear()} {siteConfig.fullName}</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-16 sm:px-8">
        <Container className="max-w-md px-0">
          <h1 className="font-display text-3xl text-brand-ink">{title}</h1>
          <p className="mt-2 text-sm text-black/60">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-center text-sm text-black/60">{footer}</div>}
        </Container>
      </div>
    </div>
  );
}
