import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

const schema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().optional(),
  description: z.string().trim().min(5),
  imageUrl: z.string(),
  bannerUrl: z.string().optional(),
  icon: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isFeatured: z.boolean().default(true),
});

export async function PATCH(req: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const slug = slugify(parsed.data.slug || parsed.data.name, { lower: true, strict: true });
  const conflict = await prisma.category.findFirst({ where: { slug, NOT: { id } } });
  if (conflict) return NextResponse.json({ error: "A category with this slug already exists" }, { status: 409 });

  const category = await prisma.category.update({ where: { id }, data: { ...parsed.data, slug } });
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/shop/${slug}`);
  return NextResponse.json(category);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return NextResponse.json({ error: `Cannot delete: ${productCount} product(s) use this category` }, { status: 400 });
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/shop");
  return NextResponse.json({ ok: true });
}
