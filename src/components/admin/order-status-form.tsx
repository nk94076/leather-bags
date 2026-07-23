"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FormField, inputClass } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED", "REFUNDED"];

export function OrderStatusForm({ orderId, currentStatus, currentTracking }: { orderId: string; currentStatus: string; currentTracking: string | null }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [tracking, setTracking] = useState(currentTracking ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, trackingNumber: tracking }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not update order");
      return;
    }
    toast.success("Order updated");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <FormField label="Order Status">
        <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Tracking Number">
        <input className={inputClass} value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="e.g. IND1234567IN" />
      </FormField>
      <Button onClick={handleSave} disabled={saving} size="sm">
        {saving ? "Updating..." : "Update Order"}
      </Button>
    </div>
  );
}
