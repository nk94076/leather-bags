import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getShopProducts } from "@/lib/data/shop";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ShopContent } from "@/components/shop/shop-content";
import { siteConfig } from "@/lib/site-config";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

async function getCategory(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({ select: { slug: true } });
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  return {
    title: category.metaTitle ?? `${category.name} | Genuine Leather`,
    description: category.metaDesc ?? category.description,
    alternates: { canonical: `${siteConfig.url}/shop/${category.slug}` },
    openGraph: { images: [category.bannerUrl ?? category.imageUrl] },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category: slug } = await params;
  const sp = await searchParams;
  const [category, categories] = await Promise.all([
    getCategory(slug),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { name: true, slug: true } }),
  ]);

  if (!category) notFound();

  const result = await getShopProducts({ ...sp, category: slug });

  return (
    <div>
      <div className="relative flex h-64 items-end overflow-hidden bg-brand-ink sm:h-80">
        {category.bannerUrl && (
          <Image src={category.bannerUrl} alt={category.name} fill priority sizes="100vw" className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <Container className="relative pb-10">
          <Breadcrumbs
            dark
            items={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: category.name }]}
          />
          <h1 className="mt-3 font-display text-4xl text-white sm:text-5xl">{category.name}</h1>
          <p className="mt-3 max-w-xl text-sm text-white/75 sm:text-base">{category.description}</p>
        </Container>
      </div>

      <Container className="py-10 sm:py-14">
        <Suspense>
          <ShopContent
            basePath={`/shop/${category.slug}`}
            categories={categories}
            lockedCategory={category.slug}
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
