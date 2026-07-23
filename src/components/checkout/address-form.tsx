"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FormField, inputClass } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

const schema = z.object({
  label: z.string().trim().min(1, "Give this address a label").max(40),
  fullName: z.string().trim().min(2, "Enter the recipient's name"),
  phone: z.string().trim().min(10, "Enter a valid phone number"),
  line1: z.string().trim().min(3, "Enter your address"),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, "Enter your city"),
  state: z.string().trim().min(2, "Enter your state"),
  postalCode: z.string().trim().min(4, "Enter a valid PIN code"),
});
export type AddressFormValues = z.infer<typeof schema>;

export function AddressForm({
  defaultValues,
  onSaved,
  onCancel,
  submitLabel = "Save Address",
}: {
  defaultValues?: Partial<AddressFormValues>;
  onSaved: (address: AddressFormValues & { id: string }) => void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormValues>({ resolver: zodResolver(schema), defaultValues });

  async function onSubmit(values: AddressFormValues) {
    setLoading(true);
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error(data.error ?? "Something went wrong");
      return;
    }
    toast.success("Address saved");
    onSaved(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Address Label" error={errors.label?.message}>
          <input className={inputClass} placeholder="Home, Office..." {...register("label")} />
        </FormField>
        <FormField label="Full Name" error={errors.fullName?.message}>
          <input className={inputClass} placeholder="Recipient's name" {...register("fullName")} />
        </FormField>
      </div>
      <FormField label="Phone Number" error={errors.phone?.message}>
        <input className={inputClass} placeholder="+91 98765 43210" {...register("phone")} />
      </FormField>
      <FormField label="Address Line 1" error={errors.line1?.message}>
        <input className={inputClass} placeholder="House no., street" {...register("line1")} />
      </FormField>
      <FormField label="Address Line 2 (Optional)">
        <input className={inputClass} placeholder="Landmark, apartment" {...register("line2")} />
      </FormField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField label="City" error={errors.city?.message}>
          <input className={inputClass} {...register("city")} />
        </FormField>
        <FormField label="State" error={errors.state?.message}>
          <input className={inputClass} {...register("state")} />
        </FormField>
        <FormField label="PIN Code" error={errors.postalCode?.message}>
          <input className={inputClass} {...register("postalCode")} />
        </FormField>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
