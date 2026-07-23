"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FormField, inputClass } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type FormValues = z.infer<typeof schema>;

export default function ChangePasswordPage() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const res = await fetch("/api/account/password", {
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
    toast.success("Password updated successfully");
    reset();
  }

  return (
    <div className="max-w-md rounded-2xl border border-black/5 bg-white p-6 sm:p-8">
      <h3 className="mb-6 font-display text-lg text-brand-ink">Change Password</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Current Password" error={errors.currentPassword?.message}>
          <input type="password" className={inputClass} {...register("currentPassword")} />
        </FormField>
        <FormField label="New Password" error={errors.newPassword?.message}>
          <input type="password" className={inputClass} {...register("newPassword")} />
        </FormField>
        <FormField label="Confirm New Password" error={errors.confirmPassword?.message}>
          <input type="password" className={inputClass} {...register("confirmPassword")} />
        </FormField>
        <Button type="submit" disabled={loading} className="mt-2 self-start">
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
}
