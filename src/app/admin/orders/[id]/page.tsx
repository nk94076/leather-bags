import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader, AdminCard } from "@/components/admin/admin-ui";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { OrderTrackingTimeline } from "@/components/account/order-tracking-timeline";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { formatDate, formatPrice } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: true, address: true, coupon: true },
  });
  if (!order) notFound();

  const history = JSON.parse(order.trackingHistory || "[]");
  const shipping = order.address ?? JSON.parse(order.shippingSnapshot || "{}");

  return (
    <div>
      <AdminPageHeader title={`Order #${order.orderNumber}`} description={`Placed on ${formatDate(order.createdAt)}`} action={<OrderStatusBadge status={order.status} />} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <AdminCard>
            <h2 className="mb-4 font-display text-lg text-brand-ink">Items</h2>
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
                  <span>Discount {order.coupon ? `(${order.coupon.code})` : ""}</span>
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
          </AdminCard>

          <AdminCard>
            <h2 className="mb-4 font-display text-lg text-brand-ink">Tracking History</h2>
            <OrderTrackingTimeline history={history} />
          </AdminCard>
        </div>

        <div className="flex flex-col gap-6">
          <AdminCard>
            <h2 className="mb-4 font-display text-lg text-brand-ink">Update Status</h2>
            <OrderStatusForm orderId={order.id} currentStatus={order.status} currentTracking={order.trackingNumber} />
          </AdminCard>

          <AdminCard>
            <h2 className="mb-3 font-display text-lg text-brand-ink">Customer</h2>
            <p className="text-sm text-brand-ink">{order.user.name}</p>
            <p className="text-sm text-black/50">{order.user.email}</p>
            <p className="text-sm text-black/50">{order.user.phone}</p>
          </AdminCard>

          <AdminCard>
            <h2 className="mb-3 font-display text-lg text-brand-ink">Shipping Address</h2>
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
          </AdminCard>

          <AdminCard>
            <h2 className="mb-3 font-display text-lg text-brand-ink">Payment</h2>
            <p className="text-sm text-black/60">
              Method: <span className="font-medium text-brand-ink">{order.paymentMethod}</span>
            </p>
            <p className="text-sm text-black/60">
              Status: <span className="font-medium text-brand-ink">{order.paymentStatus}</span>
            </p>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
