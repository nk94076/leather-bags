import { AdminPageHeader } from "@/components/admin/admin-ui";
import { CouponForm } from "@/components/admin/coupon-form";

export default function NewCouponPage() {
  return (
    <div>
      <AdminPageHeader title="Add Coupon" description="Create a new discount coupon" />
      <CouponForm />
    </div>
  );
}
