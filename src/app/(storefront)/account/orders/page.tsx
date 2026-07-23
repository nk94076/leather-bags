import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { LinkButton } from "@/components/ui/button";

export default async function OrdersPage() {
  const session = await auth();
  const orders = await prisma.order.findMany({
    where: { userId: session!.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-black/5 bg-white py-20 text-center">
        <Package size={40} className="text-black/20" />
        <p className="font-display text-xl text-brand-ink">No orders yet</p>
        <p className="text-sm text-black/50">When you place an order, it will appear here.</p>
        <LinkButton href="/shop" className="mt-2">
          Start Shopping
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {orders.map((o) => (
        <Link
          key={o.id}
          href={`/account/orders/${o.id}`}
          className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-5 transition hover:shadow-luxury sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {o.items.slice(0, 3).map((item) => (
                <div key={item.id} className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-brand-cream-dark">
                  {item.productImage && <Image src={item.productImage} alt={item.productName} fill sizes="48px" className="object-cover" />}
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-medium text-brand-ink">#{o.orderNumber}</p>
              <p className="text-xs text-black/50">
                {formatDate(o.createdAt)} • {o.items.length} item{o.items.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-brand-ink">{formatPrice(o.total)}</span>
            <OrderStatusBadge status={o.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}
