import { Compass } from "lucide-react";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center gap-6 py-24 text-center sm:py-32">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-cream text-brand-primary">
        <Compass size={36} />
      </span>
      <div>
        <p className="font-display text-7xl text-brand-primary/30 sm:text-8xl">404</p>
        <h1 className="mt-2 font-display text-2xl text-brand-ink sm:text-3xl">This Path Leads Nowhere</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-black/60">
          The page you&apos;re looking for may have been moved, renamed, or doesn&apos;t exist. Let&apos;s get you back on track.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <LinkButton href="/">Back to Home</LinkButton>
        <LinkButton href="/shop" variant="outline">
          Continue Shopping
        </LinkButton>
      </div>
    </Container>
  );
}
