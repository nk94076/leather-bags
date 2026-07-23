import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true, address: true } });
  if (!order || (order.userId !== session.user.id && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { action } = await req.json().catch(() => ({}));

  if (action === "cancel") {
    if (!["PENDING", "CONFIRMED", "PROCESSING"].includes(order.status)) {
      return NextResponse.json({ error: "This order can no longer be cancelled" }, { status: 400 });
    }
    const history = JSON.parse(order.trackingHistory || "[]");
    history.push({ status: "CANCELLED", date: new Date(), note: "Cancelled by customer" });
    const updated = await prisma.order.update({
      where: { id },
      data: { status: "CANCELLED", trackingHistory: JSON.stringify(history) },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}
