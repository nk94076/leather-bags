import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { CouponForm } from "@/components/admin/coupon-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCouponPage({ params }: Props) {
  const { id } = await params;
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) notFound();

  return (
    <div>
      <AdminPageHeader title={`Edit: ${coupon.code}`} />
      <CouponForm
        initial={{
          id: coupon.id,
          code: coupon.code,
          description: coupon.description,
          type: coupon.type,
          value: coupon.value,
          minOrderValue: coupon.minOrderValue,
          usageLimit: coupon.usageLimit,
          isActive: coupon.isActive,
          expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString() : null,
        }}
      />
    </div>
  );
}
