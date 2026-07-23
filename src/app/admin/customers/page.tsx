import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader, AdminTable, AdminTh, AdminTd } from "@/components/admin/admin-ui";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { orders: { select: { total: true } }, _count: { select: { orders: true, wishlist: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <AdminPageHeader title="Customers" description={`${customers.length} registered customers`} />

      <AdminTable>
        <thead>
          <tr>
            <AdminTh>Customer</AdminTh>
            <AdminTh>Joined</AdminTh>
            <AdminTh>Orders</AdminTh>
            <AdminTh>Total Spent</AdminTh>
            <AdminTh>Wishlist</AdminTh>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="hover:bg-brand-cream/40">
              <AdminTd>
                <Link href={`/admin/customers/${c.id}`} className="font-medium text-brand-primary hover:underline">
                  {c.name}
                </Link>
                <p className="text-xs text-black/40">{c.email}</p>
              </AdminTd>
              <AdminTd className="text-black/60">{formatDate(c.createdAt)}</AdminTd>
              <AdminTd className="text-black/60">{c._count.orders}</AdminTd>
              <AdminTd className="font-medium text-brand-ink">
                {formatPrice(c.orders.reduce((sum, o) => sum + o.total, 0))}
              </AdminTd>
              <AdminTd className="text-black/60">{c._count.wishlist}</AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  );
}
