import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader, AdminTable, AdminTh, AdminTd } from "@/components/admin/admin-ui";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { formatDate, formatPrice } from "@/lib/utils";

interface Props {
  searchParams: Promise<{ status?: string }>;
}

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED", "REFUNDED"];

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status } = await searchParams;

  const orders = await prisma.order.findMany({
    where: status ? { status: status as never } : undefined,
    include: { user: { select: { name: true, email: true } }, items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <AdminPageHeader title="Orders" description={`${orders.length} orders`} />

      <div className="mb-5 flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${!status ? "bg-brand-ink text-white" : "border border-black/10 text-black/60"}`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${status === s ? "bg-brand-ink text-white" : "border border-black/10 text-black/60"}`}
          >
            {s.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      <AdminTable>
        <thead>
          <tr>
            <AdminTh>Order</AdminTh>
            <AdminTh>Customer</AdminTh>
            <AdminTh>Date</AdminTh>
            <AdminTh>Items</AdminTh>
            <AdminTh>Total</AdminTh>
            <AdminTh>Status</AdminTh>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-brand-cream/40">
              <AdminTd>
                <Link href={`/admin/orders/${o.id}`} className="font-medium text-brand-primary hover:underline">
                  #{o.orderNumber}
                </Link>
              </AdminTd>
              <AdminTd>
                <p className="text-brand-ink">{o.user.name}</p>
                <p className="text-xs text-black/40">{o.user.email}</p>
              </AdminTd>
              <AdminTd className="text-black/60">{formatDate(o.createdAt)}</AdminTd>
              <AdminTd className="text-black/60">{o.items.length}</AdminTd>
              <AdminTd className="font-medium text-brand-ink">{formatPrice(o.total)}</AdminTd>
              <AdminTd>
                <OrderStatusBadge status={o.status} />
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  );
}
