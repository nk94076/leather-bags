import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

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

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const slug = slugify(parsed.data.slug || parsed.data.name, { lower: true, strict: true });
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ error: "A category with this slug already exists" }, { status: 409 });

  const category = await prisma.category.create({ data: { ...parsed.data, slug } });
  revalidatePath("/");
  revalidatePath("/shop");
  return NextResponse.json(category);
}
