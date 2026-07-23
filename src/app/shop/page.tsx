import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getShopProducts } from "@/lib/data/shop";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SectionHeading } from "@/components/ui/section-heading";
import { ShopContent } from "@/components/shop/shop-content";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Shop All Leather Bags",
  description:
    "Browse our full collection of premium genuine leather bags, backpacks, wallets and accessories. Filter by category, price, colour and material.",
  alternates: { canonical: `${siteConfig.url}/shop` },
};

interface ShopPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const [categories, result] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { name: true, slug: true } }),
    getShopProducts(params),
  ]);

  return (
    <div className="py-10 sm:py-14">
      <Container>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />
        <SectionHeading
          align="left"
          eyebrow="The Full Collection"
          title={params.q ? `Search results for "${params.q}"` : "Shop All"}
          description="Genuine leather bags, backpacks, wallets and accessories — handcrafted for daily life."
          className="mb-10 mt-4"
        />
        <Suspense>
          <ShopContent
            basePath="/shop"
            categories={categories}
            products={result.products}
            total={result.total}
            totalPages={result.totalPages}
            page={result.page}
          />
        </Suspense>
      </Container>
    </div>
  );
}
