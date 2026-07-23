import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

const schema = z.object({
  code: z.string().trim().min(3).max(20),
  description: z.string().trim().min(3),
  type: z.enum(["PERCENT", "FLAT"]),
  value: z.number().positive(),
  minOrderValue: z.number().min(0).default(0),
  usageLimit: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().default(true),
  expiresAt: z.string().nullable().optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const code = parsed.data.code.toUpperCase();
  const conflict = await prisma.coupon.findFirst({ where: { code, NOT: { id } } });
  if (conflict) return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 409 });

  const coupon = await prisma.coupon.update({
    where: { id },
    data: { ...parsed.data, code, expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null },
  });
  return NextResponse.json(coupon);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
