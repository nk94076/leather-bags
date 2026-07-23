import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  orderNumber: z.string().trim().min(3),
  email: z.string().trim().toLowerCase().email(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid order number and email" }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { orderNumber: parsed.data.orderNumber.toUpperCase() },
    include: { items: true, user: { select: { email: true } } },
  });

  if (!order || order.user.email.toLowerCase() !== parsed.data.email) {
    return NextResponse.json({ error: "We couldn't find an order matching those details" }, { status: 404 });
  }

  const shipping = JSON.parse(order.shippingSnapshot || "{}");

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt,
    trackingNumber: order.trackingNumber,
    trackingHistory: JSON.parse(order.trackingHistory || "[]"),
    itemCount: order.items.length,
    total: order.total,
    city: shipping.city,
    state: shipping.state,
  });
}
