import Link from "next/link";
import { Package, Heart, MapPin, ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/account/order-status-badge";

export default async function AccountOverviewPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [orders, totalOrders, wishlistCount, addressCount, user] = await Promise.all([
    prisma.order.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 3, include: { items: true } }),
    prisma.order.count({ where: { userId } }),
    prisma.wishlistItem.count({ where: { userId } }),
    prisma.address.count({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl border border-black/5 bg-white p-6 sm:p-8">
        <p className="text-sm text-black/50">Welcome back,</p>
        <h2 className="font-display text-2xl text-brand-ink">{user?.name}</h2>
        <p className="mt-1 text-sm text-black/50">{user?.email}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard icon={Package} label="Total Orders" value={String(totalOrders)} href="/account/orders" />
        <StatCard icon={Heart} label="Wishlist Items" value={String(wishlistCount)} href="/wishlist" />
        <StatCard icon={MapPin} label="Saved Addresses" value={String(addressCount)} href="/account/addresses" />
      </div>

      <div className="rounded-2xl border border-black/5 bg-white p-6 sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg text-brand-ink">Recent Orders</h3>
          <Link href="/account/orders" className="flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline">
            View All <ArrowRight size={12} />
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-black/50">You haven&apos;t placed any orders yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-black/5">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/account/orders/${o.id}`}
                className="flex flex-wrap items-center justify-between gap-3 py-4 hover:bg-brand-cream/50"
              >
                <div>
                  <p className="text-sm font-medium text-brand-ink">#{o.orderNumber}</p>
                  <p className="text-xs text-black/50">
                    {formatDate(o.createdAt)} • {o.items.length} item{o.items.length > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-brand-ink">{formatPrice(o.total)}</span>
                  <OrderStatusBadge status={o.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, href }: { icon: typeof Package; label: string; value: string; href: string }) {
  return (
    <Link href={href} className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-5 transition hover:shadow-luxury">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-cream text-brand-primary">
        <Icon size={20} />
      </span>
      <div>
        <p className="font-display text-2xl text-brand-ink">{value}</p>
        <p className="text-xs text-black/50">{label}</p>
      </div>
    </Link>
  );
}
