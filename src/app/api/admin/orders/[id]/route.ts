import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

const schema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
    "RETURNED",
    "REFUNDED",
  ]),
  trackingNumber: z.string().optional(),
  note: z.string().optional(),
});

const STATUS_NOTES: Record<string, string> = {
  PENDING: "Order placed",
  CONFIRMED: "Order confirmed and payment verified",
  PROCESSING: "Order is being packed at our warehouse",
  SHIPPED: "Order has been shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered successfully",
  CANCELLED: "Order cancelled",
  RETURNED: "Order returned",
  REFUNDED: "Refund processed",
};

export async function PATCH(req: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const history = JSON.parse(order.trackingHistory || "[]");
  if (order.status !== parsed.data.status) {
    history.push({ status: parsed.data.status, date: new Date(), note: parsed.data.note || STATUS_NOTES[parsed.data.status] });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: parsed.data.status,
      trackingNumber: parsed.data.trackingNumber || order.trackingNumber,
      trackingHistory: JSON.stringify(history),
      paymentStatus: parsed.data.status === "DELIVERED" && order.paymentMethod === "COD" ? "PAID" : order.paymentStatus,
    },
  });

  return NextResponse.json(updated);
}
