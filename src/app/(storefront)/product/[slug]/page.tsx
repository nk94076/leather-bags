import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { productCardInclude, toProductCardData } from "@/lib/data/products";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { ProductTabs, type SpecRow } from "@/components/product/product-tabs";
import { ProductGridSection } from "@/components/home/product-grid-section";
import { RecentlyViewed } from "@/components/home/recently-viewed";
import { TrackRecentlyViewed } from "@/components/product/track-recently-viewed";
import { siteConfig } from "@/lib/site-config";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      ...productCardInclude,
      reviews: { where: { status: "APPROVED" }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function generateStaticParams() {
  const products = await prisma.product.findMany({ select: { slug: true }, take: 50 });
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  const image = product.images[0]?.url;
  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDesc ?? product.shortDescription,
    alternates: { canonical: `${siteConfig.url}/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: image ? [image] : undefined,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
    include: productCardInclude,
    take: 4,
  });

  const colors = JSON.parse(product.colors) as { name: string; hex: string }[];

  const specs: SpecRow[] = [
    { label: "Leather Type", value: product.leatherType },
    { label: "Dimensions", value: product.dimensions ?? "—" },
    { label: "Weight", value: product.weight ?? "—" },
    { label: "Warranty", value: product.warranty ?? "—" },
    { label: "SKU", value: product.sku },
    { label: "Care Instructions", value: product.careInstructions ?? "—" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((i) => i.url),
    description: product.shortDescription,
    sku: product.sku,
    brand: { "@type": "Brand", name: siteConfig.name },
    aggregateRating:
      product.reviewCount > 0
        ? { "@type": "AggregateRating", ratingValue: product.avgRating, reviewCount: product.reviewCount }
        : undefined,
    offers: {
      "@type": "Offer",
      url: `${siteConfig.url}/product/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TrackRecentlyViewed productId={product.id} />
      <Container>
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: product.category.name, href: `/shop/${product.category.slug}` },
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} />
          <ProductInfo
            product={{
              id: product.id,
              name: product.name,
              sku: product.sku,
              slug: product.slug,
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              avgRating: product.avgRating,
              reviewCount: product.reviewCount,
              stock: product.stock,
              leatherType: product.leatherType,
              colors,
              shortDescription: product.shortDescription,
              image: product.images[0]?.url ?? "",
              categoryName: product.category.name,
              categorySlug: product.category.slug,
            }}
          />
        </div>

        <div className="mt-16">
          <ProductTabs
            description={product.description}
            specs={specs}
            productId={product.id}
            avgRating={product.avgRating}
            reviews={product.reviews.map((r) => ({
              id: r.id,
              authorName: r.authorName,
              rating: r.rating,
              title: r.title,
              comment: r.comment,
              createdAt: r.createdAt.toISOString(),
              adminReply: r.adminReply,
            }))}
          />
        </div>
      </Container>

      {related.length > 0 && (
        <ProductGridSection
          eyebrow="You May Also Like"
          title="Related Products"
          products={related.map(toProductCardData)}
          viewAllHref={`/shop/${product.category.slug}`}
        />
      )}

      <RecentlyViewed excludeId={product.id} />
    </div>
  );
}
