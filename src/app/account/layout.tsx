import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { AccountNav } from "@/components/account/account-nav";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your Corium account, orders, addresses and wishlist.",
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-10 sm:py-14">
      <Container>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My Account" }]} />
        <h1 className="mb-8 mt-4 font-display text-3xl text-brand-ink sm:text-4xl">My Account</h1>
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="lg:w-64 lg:shrink-0">
            <AccountNav />
          </div>
          <div className="flex-1">{children}</div>
        </div>
      </Container>
    </div>
  );
}
