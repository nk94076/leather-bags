import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader, AdminCard } from "@/components/admin/admin-ui";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { formatDate, formatPrice } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminCustomerDetailPage({ params }: Props) {
  const { id } = await params;
  const customer = await prisma.user.findUnique({
    where: { id },
    include: {
      addresses: true,
      orders: { orderBy: { createdAt: "desc" } },
      wishlist: { include: { product: { select: { name: true, price: true, slug: true } } } },
    },
  });
  if (!customer) notFound();

  const totalSpent = customer.orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      <AdminPageHeader title={customer.name} description={customer.email} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <AdminCard>
            <h2 className="mb-4 font-display text-lg text-brand-ink">Orders ({customer.orders.length})</h2>
            <div className="flex flex-col divide-y divide-black/5">
              {customer.orders.map((o) => (
                <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-brand-ink">#{o.orderNumber}</p>
                    <p className="text-xs text-black/50">{formatDate(o.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-brand-ink">{formatPrice(o.total)}</span>
                    <OrderStatusBadge status={o.status} />
                  </div>
                </Link>
              ))}
              {customer.orders.length === 0 && <p className="py-3 text-sm text-black/40">No orders yet.</p>}
            </div>
          </AdminCard>

          <AdminCard>
            <h2 className="mb-4 font-display text-lg text-brand-ink">Wishlist ({customer.wishlist.length})</h2>
            <div className="flex flex-col divide-y divide-black/5">
              {customer.wishlist.map((w) => (
                <Link key={w.id} href={`/product/${w.product.slug}`} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-brand-ink">{w.product.name}</span>
                  <span className="text-black/50">{formatPrice(w.product.price)}</span>
                </Link>
              ))}
              {customer.wishlist.length === 0 && <p className="py-3 text-sm text-black/40">No wishlist items.</p>}
            </div>
          </AdminCard>
        </div>

        <div className="flex flex-col gap-6">
          <AdminCard>
            <h2 className="mb-3 font-display text-lg text-brand-ink">Summary</h2>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-black/50">Total Orders</span>
                <span className="font-medium text-brand-ink">{customer.orders.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/50">Total Spent</span>
                <span className="font-medium text-brand-ink">{formatPrice(totalSpent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/50">Joined</span>
                <span className="font-medium text-brand-ink">{formatDate(customer.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/50">Phone</span>
                <span className="font-medium text-brand-ink">{customer.phone ?? "—"}</span>
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <h2 className="mb-3 font-display text-lg text-brand-ink">Addresses</h2>
            <div className="flex flex-col gap-4">
              {customer.addresses.map((a) => (
                <div key={a.id} className="text-sm">
                  <p className="font-medium text-brand-ink">{a.label}</p>
                  <p className="text-black/50">
                    {a.line1}, {a.city}, {a.state} {a.postalCode}
                  </p>
                </div>
              ))}
              {customer.addresses.length === 0 && <p className="text-sm text-black/40">No addresses saved.</p>}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
