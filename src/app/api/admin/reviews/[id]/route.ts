import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

const schema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  adminReply: z.string().optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const review = await prisma.review.update({ where: { id }, data: parsed.data });

  const agg = await prisma.review.aggregate({
    where: { productId: review.productId, status: "APPROVED" },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: review.productId },
    data: { avgRating: Math.round((agg._avg.rating ?? 0) * 10) / 10, reviewCount: agg._count },
  });

  return NextResponse.json(review);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.review.delete({ where: { id } });

  const agg = await prisma.review.aggregate({
    where: { productId: review.productId, status: "APPROVED" },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: review.productId },
    data: { avgRating: Math.round((agg._avg.rating ?? 0) * 10) / 10, reviewCount: agg._count },
  });

  return NextResponse.json({ ok: true });
}
