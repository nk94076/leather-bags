import Link from "next/link";
import Image from "next/image";
import { IndianRupee, ShoppingCart, Package, Users, TrendingUp, FolderTree } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader, AdminCard, AdminStatCard } from "@/components/admin/admin-ui";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { SalesChart } from "@/components/admin/sales-chart";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [orderCount, revenueAgg, productCount, categoryCount, customerCount, recentOrders, orders30d, topProducts] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
    prisma.product.count(),
    prisma.category.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { user: { select: { name: true } } } }),
    prisma.order.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true, total: true } }),
    prisma.product.findMany({ orderBy: { reviewCount: "desc" }, take: 5, include: { images: { take: 1 } } }),
  ]);

  const dayMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    dayMap.set(d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }), 0);
  }
  orders30d.forEach((o) => {
    const key = o.createdAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) ?? 0) + o.total);
  });
  const chartData = Array.from(dayMap.entries()).map(([date, revenue]) => ({ date, revenue }));

  return (
    <div>
      <AdminPageHeader title="Dashboard" description="Overview of your store's performance" />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <AdminStatCard icon={IndianRupee} label="Total Revenue" value={formatPrice(revenueAgg._sum.total ?? 0)} href="/admin/orders" />
        <AdminStatCard icon={ShoppingCart} label="Orders" value={String(orderCount)} href="/admin/orders" />
        <AdminStatCard icon={Package} label="Products" value={String(productCount)} href="/admin/products" />
        <AdminStatCard icon={FolderTree} label="Categories" value={String(categoryCount)} href="/admin/categories" />
        <AdminStatCard icon={Users} label="Customers" value={String(customerCount)} href="/admin/customers" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AdminCard className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg text-brand-ink">Sales — Last 30 Days</h2>
            <TrendingUp size={18} className="text-brand-primary" />
          </div>
          <SalesChart data={chartData} />
        </AdminCard>

        <AdminCard>
          <h2 className="mb-4 font-display text-lg text-brand-ink">Top Products</h2>
          <div className="flex flex-col gap-4">
            {topProducts.map((p, i) => (
              <Link key={p.id} href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                <span className="w-4 text-xs font-semibold text-black/30">{i + 1}</span>
                <div className="relative h-10 w-9 shrink-0 overflow-hidden rounded-lg bg-brand-cream-dark">
                  {p.images[0] && <Image src={p.images[0].url} alt={p.name} fill sizes="40px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-brand-ink">{p.name}</p>
                  <p className="text-xs text-black/40">{p.reviewCount} reviews • {formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </AdminCard>
      </div>

      <AdminCard className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-brand-ink">Latest Orders</h2>
          <Link href="/admin/orders" className="text-xs font-medium text-brand-primary hover:underline">
            View All
          </Link>
        </div>
        <div className="flex flex-col divide-y divide-black/5">
          {recentOrders.map((o) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-medium text-brand-ink">#{o.orderNumber}</p>
                <p className="text-xs text-black/50">
                  {o.user.name} • {formatDate(o.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-brand-ink">{formatPrice(o.total)}</span>
                <OrderStatusBadge status={o.status} />
              </div>
            </Link>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}
