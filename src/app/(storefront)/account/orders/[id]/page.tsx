import Image from "next/image";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { OrderTrackingTimeline } from "@/components/account/order-tracking-timeline";
import { CancelOrderButton } from "@/components/account/cancel-order-button";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, address: true },
  });

  if (!order || order.userId !== session!.user.id) notFound();

  const history = JSON.parse(order.trackingHistory || "[]");
  const shipping = order.address ?? JSON.parse(order.shippingSnapshot || "{}");
  const canCancel = ["PENDING", "CONFIRMED", "PROCESSING"].includes(order.status);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/5 bg-white p-6">
        <div>
          <p className="font-display text-xl text-brand-ink">Order #{order.orderNumber}</p>
          <p className="text-xs text-black/50">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          {canCancel && <CancelOrderButton orderId={order.id} />}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="rounded-2xl border border-black/5 bg-white p-6">
            <h3 className="mb-4 font-display text-lg text-brand-ink">Items</h3>
            <div className="flex flex-col gap-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-brand-cream-dark">
                    {item.productImage && <Image src={item.productImage} alt={item.productName} fill sizes="80px" className="object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-brand-ink">{item.productName}</p>
                    <p className="text-xs text-black/40">
                      {item.color ? `${item.color} • ` : ""}Qty {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-brand-ink">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-col gap-2 border-t border-black/5 pt-5 text-sm">
              <div className="flex justify-between text-black/60">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount</span>
                  <span>−{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-black/60">
                <span>Shipping</span>
                <span>{order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-black/60">
                <span>Tax</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between border-t border-black/10 pt-2 text-base font-semibold text-brand-ink">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-6">
            <h3 className="mb-4 font-display text-lg text-brand-ink">Tracking</h3>
            {order.trackingNumber && (
              <p className="mb-4 text-sm text-black/60">
                Tracking Number: <span className="font-medium text-brand-ink">{order.trackingNumber}</span>
              </p>
            )}
            <OrderTrackingTimeline history={history} />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-black/5 bg-white p-6">
            <h3 className="mb-3 font-display text-lg text-brand-ink">Shipping Address</h3>
            <p className="text-sm text-black/60">
              {shipping.fullName}
              <br />
              {shipping.line1}
              {shipping.line2 ? `, ${shipping.line2}` : ""}
              <br />
              {shipping.city}, {shipping.state} {shipping.postalCode}
              <br />
              {shipping.phone}
            </p>
          </div>
          <div className="rounded-2xl border border-black/5 bg-white p-6">
            <h3 className="mb-3 font-display text-lg text-brand-ink">Payment</h3>
            <p className="text-sm text-black/60">
              Method: <span className="font-medium text-brand-ink">{order.paymentMethod}</span>
            </p>
            <p className="text-sm text-black/60">
              Status: <span className="font-medium text-brand-ink">{order.paymentStatus}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
