import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader, AdminTable, AdminTh, AdminTd } from "@/components/admin/admin-ui";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <AdminPageHeader
        title="Coupons"
        description={`${coupons.length} coupons`}
        action={
          <LinkButton href="/admin/coupons/new" size="sm">
            <Plus size={14} /> Add Coupon
          </LinkButton>
        }
      />

      <AdminTable>
        <thead>
          <tr>
            <AdminTh>Code</AdminTh>
            <AdminTh>Discount</AdminTh>
            <AdminTh>Min Order</AdminTh>
            <AdminTh>Usage</AdminTh>
            <AdminTh>Expires</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh className="text-right">Actions</AdminTh>
          </tr>
        </thead>
        <tbody>
          {coupons.map((c) => (
            <tr key={c.id} className="hover:bg-brand-cream/40">
              <AdminTd>
                <p className="font-mono font-medium text-brand-ink">{c.code}</p>
                <p className="text-xs text-black/40">{c.description}</p>
              </AdminTd>
              <AdminTd className="text-black/60">{c.type === "PERCENT" ? `${c.value}%` : formatPrice(c.value)}</AdminTd>
              <AdminTd className="text-black/60">{formatPrice(c.minOrderValue)}</AdminTd>
              <AdminTd className="text-black/60">
                {c.usedCount} / {c.usageLimit ?? "∞"}
              </AdminTd>
              <AdminTd className="text-black/60">{c.expiresAt ? formatDate(c.expiresAt) : "—"}</AdminTd>
              <AdminTd>
                <Badge variant={c.isActive ? "outline" : "solid"}>{c.isActive ? "Active" : "Inactive"}</Badge>
              </AdminTd>
              <AdminTd>
                <div className="flex items-center justify-end gap-3">
                  <Link href={`/admin/coupons/${c.id}`} className="text-black/40 hover:text-brand-primary">
                    <Pencil size={15} />
                  </Link>
                  <DeleteButton endpoint={`/api/admin/coupons/${c.id}`} confirmMessage="Delete this coupon?" />
                </div>
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  );
}
