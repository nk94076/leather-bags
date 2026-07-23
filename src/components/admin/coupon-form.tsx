"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FormField, inputClass } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

export interface CouponFormValues {
  id?: string;
  code: string;
  description: string;
  type: "PERCENT" | "FLAT";
  value: number;
  minOrderValue: number;
  usageLimit: number | null;
  isActive: boolean;
  expiresAt: string | null;
}

export function CouponForm({ initial }: { initial?: CouponFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState<CouponFormValues>(
    initial ?? {
      code: "",
      description: "",
      type: "PERCENT",
      value: 10,
      minOrderValue: 0,
      usageLimit: null,
      isActive: true,
      expiresAt: null,
    }
  );
  const [saving, setSaving] = useState(false);

  function set<K extends keyof CouponFormValues>(key: K, value: CouponFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const endpoint = initial?.id ? `/api/admin/coupons/${initial.id}` : "/api/admin/coupons";
    const method = initial?.id ? "PATCH" : "POST";
    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      toast.error(data.error ?? "Something went wrong");
      return;
    }
    toast.success(initial?.id ? "Coupon updated" : "Coupon created");
    router.push("/admin/coupons");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-5 rounded-2xl border border-black/5 bg-white p-6">
      <FormField label="Coupon Code">
        <input required className={`${inputClass} uppercase`} value={values.code} onChange={(e) => set("code", e.target.value.toUpperCase())} />
      </FormField>
      <FormField label="Description">
        <input required className={inputClass} value={values.description} onChange={(e) => set("description", e.target.value)} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Discount Type">
          <select className={inputClass} value={values.type} onChange={(e) => set("type", e.target.value as "PERCENT" | "FLAT")}>
            <option value="PERCENT">Percentage (%)</option>
            <option value="FLAT">Flat Amount (₹)</option>
          </select>
        </FormField>
        <FormField label={values.type === "PERCENT" ? "Discount %" : "Discount Amount (₹)"}>
          <input
            required
            type="number"
            min={0}
            className={inputClass}
            value={values.value}
            onChange={(e) => set("value", Number(e.target.value))}
          />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Minimum Order Value (₹)">
          <input
            type="number"
            min={0}
            className={inputClass}
            value={values.minOrderValue}
            onChange={(e) => set("minOrderValue", Number(e.target.value))}
          />
        </FormField>
        <FormField label="Usage Limit (blank = unlimited)">
          <input
            type="number"
            min={1}
            className={inputClass}
            value={values.usageLimit ?? ""}
            onChange={(e) => set("usageLimit", e.target.value ? Number(e.target.value) : null)}
          />
        </FormField>
      </div>
      <FormField label="Expiry Date (optional)">
        <input
          type="date"
          className={inputClass}
          value={values.expiresAt ? values.expiresAt.slice(0, 10) : ""}
          onChange={(e) => set("expiresAt", e.target.value || null)}
        />
      </FormField>
      <label className="flex items-center justify-between text-sm">
        <span className="text-black/70">Active</span>
        <input type="checkbox" checked={values.isActive} onChange={(e) => set("isActive", e.target.checked)} className="h-4 w-4 accent-brand-primary" />
      </label>
      <Button type="submit" disabled={saving} className="self-start">
        {saving ? "Saving..." : initial?.id ? "Save Changes" : "Create Coupon"}
      </Button>
    </form>
  );
}
