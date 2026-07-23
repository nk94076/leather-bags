import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { productCardInclude } from "@/lib/data/products";

const productSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().optional(),
  sku: z.string().trim().min(2),
  categoryId: z.string(),
  leatherType: z.string(),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().nullable().optional(),
  stock: z.number().int().min(0),
  colors: z.array(z.object({ name: z.string(), hex: z.string() })),
  shortDescription: z.string().trim().min(5),
  description: z.string().trim().min(10),
  dimensions: z.string().optional(),
  weight: z.string().optional(),
  warranty: z.string().optional(),
  careInstructions: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isLatest: z.boolean().optional(),
  isActive: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
  images: z.array(z.object({ url: z.string(), altText: z.string() })),
});

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const q = req.nextUrl.searchParams.get("q") ?? "";
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page")) || 1);
  const perPage = 20;

  const where = q
    ? { OR: [{ name: { contains: q } }, { sku: { contains: q } }] }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productCardInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, totalPages: Math.max(1, Math.ceil(total / perPage)) });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;
  const slug = slugify(data.slug || data.name, { lower: true, strict: true });

  const existingSlug = await prisma.product.findUnique({ where: { slug } });
  if (existingSlug) return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
  const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
  if (existingSku) return NextResponse.json({ error: "A product with this SKU already exists" }, { status: 409 });

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      sku: data.sku,
      shortDescription: data.shortDescription,
      description: data.description,
      categoryId: data.categoryId,
      leatherType: data.leatherType,
      price: data.price,
      compareAtPrice: data.compareAtPrice ?? null,
      stock: data.stock,
      colors: JSON.stringify(data.colors),
      dimensions: data.dimensions,
      weight: data.weight,
      warranty: data.warranty,
      careInstructions: data.careInstructions,
      isFeatured: data.isFeatured ?? false,
      isTrending: data.isTrending ?? false,
      isLatest: data.isLatest ?? false,
      isActive: data.isActive ?? true,
      metaTitle: data.metaTitle,
      metaDesc: data.metaDesc,
      images: { create: data.images.map((img, i) => ({ ...img, sortOrder: i })) },
      variants: {
        create: data.colors.map((c, i) => ({
          color: c.name,
          colorHex: c.hex,
          sku: `${data.sku}-${i + 1}`,
          stock: Math.max(0, Math.round(data.stock / Math.max(data.colors.length, 1))),
        })),
      },
    },
  });

  return NextResponse.json(product);
}
