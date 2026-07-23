import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { productCardInclude, toProductCardData } from "@/lib/data/products";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import type { ProductCardData } from "@/types/catalog";

export interface ShopFilters {
  q?: string;
  category?: string;
  color?: string;
  material?: string;
  availability?: string;
  rating?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
}

function buildOrderBy(sort?: string): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "latest":
      return [{ createdAt: "desc" }];
    case "price-asc":
      return [{ price: "asc" }];
    case "price-desc":
      return [{ price: "desc" }];
    case "rating":
      return [{ avgRating: "desc" }];
    case "popularity":
      return [{ reviewCount: "desc" }];
    default:
      return [{ isFeatured: "desc" }, { createdAt: "desc" }];
  }
}

export async function getShopProducts(filters: ShopFilters): Promise<{
  products: ProductCardData[];
  total: number;
  totalPages: number;
  page: number;
}> {
  const where: Prisma.ProductWhereInput = { isActive: true };
  const andConditions: Prisma.ProductWhereInput[] = [];

  if (filters.q) {
    andConditions.push({
      OR: [
        { name: { contains: filters.q } },
        { shortDescription: { contains: filters.q } },
        { description: { contains: filters.q } },
      ],
    });
  }

  if (filters.category) {
    const slugs = filters.category.split(",").filter(Boolean);
    if (slugs.length) where.category = { slug: { in: slugs } };
  }

  if (filters.material) {
    const materials = filters.material.split(",").filter(Boolean);
    if (materials.length) where.leatherType = { in: materials };
  }

  if (filters.color) {
    const colors = filters.color.split(",").filter(Boolean);
    if (colors.length) andConditions.push({ OR: colors.map((c) => ({ colors: { contains: c } })) });
  }

  if (andConditions.length) where.AND = andConditions;

  if (filters.availability === "in-stock") where.stock = { gt: 0 };
  if (filters.availability === "out-of-stock") where.stock = { equals: 0 };

  if (filters.rating) {
    const minRating = Number(filters.rating);
    if (!Number.isNaN(minRating)) where.avgRating = { gte: minRating };
  }

  if (filters.minPrice || filters.maxPrice) {
    where.price = {
      ...(filters.minPrice ? { gte: Number(filters.minPrice) } : {}),
      ...(filters.maxPrice ? { lte: Number(filters.maxPrice) } : {}),
    };
  }

  const page = Math.max(1, Number(filters.page) || 1);
  const skip = (page - 1) * PRODUCTS_PER_PAGE;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productCardInclude,
      orderBy: buildOrderBy(filters.sort),
      skip,
      take: PRODUCTS_PER_PAGE,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map(toProductCardData),
    total,
    totalPages: Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE)),
    page,
  };
}
