import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productCardInclude, toProductCardData } from "@/lib/data/products";

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids")?.split(",").filter(Boolean) ?? [];
  if (ids.length === 0) return NextResponse.json([]);

  const products = await prisma.product.findMany({
    where: { id: { in: ids }, isActive: true },
    include: productCardInclude,
  });

  const byId = new Map(products.map((p) => [p.id, p]));
  const ordered = ids.map((id) => byId.get(id)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return NextResponse.json(ordered.map(toProductCardData));
}
