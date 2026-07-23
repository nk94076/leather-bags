import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ products: [], categories: [] });

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, name: { contains: q } },
      select: { id: true, name: true, slug: true, price: true, images: { take: 1, orderBy: { sortOrder: "asc" } } },
      take: 5,
    }),
    prisma.category.findMany({
      where: { name: { contains: q } },
      select: { name: true, slug: true },
      take: 3,
    }),
  ]);

  return NextResponse.json({
    products: products.map((p) => ({ id: p.id, name: p.name, slug: p.slug, price: p.price, image: p.images[0]?.url ?? "" })),
    categories,
  });
}
