import { Prisma } from "@prisma/client";
import type { ProductCardData } from "@/types/catalog";

const productCardArgs = Prisma.validator<Prisma.ProductDefaultArgs>()({
  include: {
    category: { select: { name: true, slug: true } },
    images: { orderBy: { sortOrder: "asc" } },
  },
});

export type ProductWithRelations = Prisma.ProductGetPayload<typeof productCardArgs>;

export function toProductCardData(p: ProductWithRelations): ProductCardData {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    avgRating: p.avgRating,
    reviewCount: p.reviewCount,
    isTrending: p.isTrending,
    isLatest: p.isLatest,
    stock: p.stock,
    category: p.category,
    images: p.images.map((i) => ({ url: i.url, altText: i.altText })),
    colors: JSON.parse(p.colors),
  };
}

export const productCardInclude = productCardArgs.include;
