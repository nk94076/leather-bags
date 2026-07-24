import { prisma } from "@/lib/prisma";
import { productCardInclude, toProductCardData } from "@/lib/data/products";
import { Hero } from "@/components/home/hero";
import { CategoriesSection } from "@/components/home/categories-section";
import { ProductGridSection } from "@/components/home/product-grid-section";
import { TrendingCarousel } from "@/components/home/trending-carousel";
import { PromoBanners } from "@/components/home/promo-banners";
import { RecentlyViewed } from "@/components/home/recently-viewed";
import { WhyChooseUs, type WhyChooseUsItem } from "@/components/home/why-choose-us";
import { ReviewsSlider } from "@/components/home/reviews-slider";
import { InstagramGallery } from "@/components/home/instagram-gallery";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: siteConfig.url },
};

async function getHomepageData() {
  const [categories, banners, sections, latestProducts, trendingProducts, reviews] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, take: 10 }),
    prisma.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.homepageSection.findMany(),
    prisma.product.findMany({
      where: { isActive: true, isLatest: true },
      include: productCardInclude,
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.product.findMany({
      where: { isActive: true, isTrending: true },
      include: productCardInclude,
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.review.findMany({
      where: { status: "APPROVED", rating: { gte: 4 } },
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 9,
    }),
  ]);

  const sectionMap = new Map(sections.map((s) => [s.key, s]));
  return { categories, banners, sectionMap, latestProducts, trendingProducts, reviews };
}

export default async function HomePage() {
  const { categories, banners, sectionMap, latestProducts, trendingProducts, reviews } = await getHomepageData();

  const heroBanners = banners.filter((b) => b.placement === "hero");
  const promoLeft = banners.find((b) => b.placement === "promo-left");
  const promoRight = banners.find((b) => b.placement === "promo-right");

  const categoriesSection = sectionMap.get("categories");
  const latestSection = sectionMap.get("latest-products");
  const trendingSection = sectionMap.get("trending-products");
  const whyChooseSection = sectionMap.get("why-choose-us");
  const reviewsSection = sectionMap.get("reviews");
  const instagramSection = sectionMap.get("instagram");
  const newsletterSection = sectionMap.get("newsletter");

  const whyChooseItems: WhyChooseUsItem[] = whyChooseSection
    ? (JSON.parse(whyChooseSection.content).items ?? [])
    : [];
  const instagramImages: string[] = instagramSection ? JSON.parse(instagramSection.content).images ?? [] : [];

  const isVisible = (section: { isVisible: boolean } | undefined) => section?.isVisible !== false;
  const recentlyViewedSection = sectionMap.get("recently-viewed");
  const promoBannersSection = sectionMap.get("promo-banners");

  return (
    <>
      <Hero
        slides={heroBanners.map((b) => ({
          title: b.title,
          subtitle: b.subtitle,
          ctaLabel: b.ctaLabel,
          ctaUrl: b.ctaUrl,
          imageUrl: b.imageUrl,
        }))}
      />

      {isVisible(categoriesSection) && (
        <CategoriesSection
          title={categoriesSection?.title ?? "Shop by Category"}
          subtitle={categoriesSection?.subtitle}
          categories={categories}
        />
      )}

      {isVisible(latestSection) && (
        <ProductGridSection
          eyebrow="Just Arrived"
          title={latestSection?.title ?? "Latest Arrivals"}
          subtitle={latestSection?.subtitle}
          products={latestProducts.map(toProductCardData)}
          viewAllHref="/shop?sort=latest"
        />
      )}

      {isVisible(trendingSection) && (
        <TrendingCarousel
          title={trendingSection?.title ?? "Trending Now"}
          subtitle={trendingSection?.subtitle}
          products={trendingProducts.map(toProductCardData)}
        />
      )}

      {isVisible(promoBannersSection) && (
        <PromoBanners
          left={
            promoLeft && {
              title: promoLeft.title,
              subtitle: promoLeft.subtitle,
              ctaLabel: promoLeft.ctaLabel,
              ctaUrl: promoLeft.ctaUrl,
              imageUrl: promoLeft.imageUrl,
            }
          }
          right={
            promoRight && {
              title: promoRight.title,
              subtitle: promoRight.subtitle,
              ctaLabel: promoRight.ctaLabel,
              ctaUrl: promoRight.ctaUrl,
              imageUrl: promoRight.imageUrl,
            }
          }
        />
      )}

      {isVisible(recentlyViewedSection) && <RecentlyViewed />}

      {isVisible(whyChooseSection) && whyChooseItems.length > 0 && (
        <WhyChooseUs
          title={whyChooseSection?.title ?? "Why Choose Corium"}
          subtitle={whyChooseSection?.subtitle}
          items={whyChooseItems}
        />
      )}

      {isVisible(reviewsSection) && (
        <ReviewsSlider
          title={reviewsSection?.title ?? "Loved by Our Customers"}
          subtitle={reviewsSection?.subtitle}
          reviews={reviews.map((r) => ({
            id: r.id,
            authorName: r.authorName,
            rating: r.rating,
            title: r.title,
            comment: r.comment,
            productName: r.product.name,
          }))}
        />
      )}

      {isVisible(instagramSection) && (
        <InstagramGallery
          title={instagramSection?.title ?? "Follow @corium.leather"}
          subtitle={instagramSection?.subtitle}
          images={instagramImages}
        />
      )}

      {isVisible(newsletterSection) && (
        <NewsletterSection
          title={newsletterSection?.title ?? "Join the Corium Circle"}
          subtitle={newsletterSection?.subtitle}
        />
      )}
    </>
  );
}
