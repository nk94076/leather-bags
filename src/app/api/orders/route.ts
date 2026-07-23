import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";

const schema = z.object({
  addressId: z.string(),
  paymentMethod: z.enum(["COD", "UPI", "CARD", "NETBANKING", "WALLET"]),
  couponCode: z.string().trim().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string().optional(),
        quantity: z.number().int().min(1).max(20),
        color: z.string().optional(),
      })
    )
    .min(1),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { addressId, paymentMethod, couponCode, items } = parsed.data;

  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== session.user.id) {
    return NextResponse.json({ error: "Please select a valid shipping address" }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) return NextResponse.json({ error: "One of the items is no longer available" }, { status: 400 });
    if (product.stock < item.quantity) {
      return NextResponse.json({ error: `${product.name} is out of stock` }, { status: 400 });
    }
  }

  const subtotal = items.reduce((sum, item) => {
    const product = productMap.get(item.productId)!;
    return sum + product.price * item.quantity;
  }, 0);

  let discount = 0;
  let coupon = null;
  if (couponCode) {
    coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
    if (coupon && coupon.isActive && subtotal >= coupon.minOrderValue) {
      discount = coupon.type === "PERCENT" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
      discount = Math.min(discount, subtotal);
    } else {
      coupon = null;
    }
  }

  const shippingSetting = await prisma.setting.findUnique({ where: { key: "shipping" } });
  const shippingConfig = shippingSetting ? JSON.parse(shippingSetting.value) : { freeShippingThreshold: 999, standardFee: 149 };
  const shippingFee = subtotal - discount >= shippingConfig.freeShippingThreshold ? 0 : shippingConfig.standardFee;

  const taxSetting = await prisma.setting.findUnique({ where: { key: "tax" } });
  const taxConfig = taxSetting ? JSON.parse(taxSetting.value) : { gstPercent: 5 };
  const tax = Math.round(((subtotal - discount) * taxConfig.gstPercent) / 100);

  const total = subtotal - discount + shippingFee + tax;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session.user.id,
        addressId: address.id,
        shippingSnapshot: JSON.stringify({
          fullName: address.fullName,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        }),
        status: "PENDING",
        paymentMethod,
        paymentStatus: paymentMethod === "COD" ? "PENDING" : "PAID",
        subtotal,
        discount,
        shippingFee,
        tax,
        total,
        couponId: coupon?.id,
        trackingHistory: JSON.stringify([{ status: "PENDING", date: new Date(), note: "Order placed" }]),
        items: {
          create: items.map((item) => {
            const product = productMap.get(item.productId)!;
            return {
              productId: product.id,
              variantId: item.variantId,
              productName: product.name,
              productImage: product.images[0]?.url ?? "",
              color: item.color,
              price: product.price,
              quantity: item.quantity,
            };
          }),
        },
      },
    });

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    if (coupon) {
      await tx.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
    }

    return created;
  });

  return NextResponse.json({ id: order.id, orderNumber: order.orderNumber });
}
