import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: "daily", priority: 1 },
    { url: `${siteConfig.url}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteConfig.url}/about-us`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteConfig.url}/contact-us`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteConfig.url}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteConfig.url}/track-order`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteConfig.url}/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteConfig.url}/terms-and-conditions`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteConfig.url}/shipping-return-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteConfig.url}/login`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${siteConfig.url}/register`, changeFrequency: "yearly", priority: 0.1 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${siteConfig.url}/shop/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${siteConfig.url}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
