import { NextResponse } from "next/server";
import slugify from "slugify";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

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

export async function GET(_req: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;
  const slug = slugify(data.slug || data.name, { lower: true, strict: true });

  const conflict = await prisma.product.findFirst({ where: { slug, NOT: { id } } });
  if (conflict) return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });

  await prisma.productImage.deleteMany({ where: { productId: id } });
  await prisma.productVariant.deleteMany({ where: { productId: id } });

  const product = await prisma.product.update({
    where: { id },
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

export async function DELETE(_req: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
