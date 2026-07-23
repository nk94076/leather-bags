import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { code, subtotal } = await req.json().catch(() => ({}));
  if (!code) return NextResponse.json({ error: "Enter a coupon code" }, { status: 400 });

  const coupon = await prisma.coupon.findUnique({ where: { code: String(code).toUpperCase() } });

  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
  }
  if (subtotal < coupon.minOrderValue) {
    return NextResponse.json(
      { error: `Minimum order value for this coupon is ₹${coupon.minOrderValue.toLocaleString("en-IN")}` },
      { status: 400 }
    );
  }

  const discount = coupon.type === "PERCENT" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;

  return NextResponse.json({
    code: coupon.code,
    description: coupon.description,
    type: coupon.type,
    value: coupon.value,
    discount: Math.min(discount, subtotal),
  });
}
