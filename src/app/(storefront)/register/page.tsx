"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField, inputClass } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z.string().trim().min(10, "Enter a valid 10-digit phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }
      const signInRes = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      setLoading(false);
      if (signInRes?.error) {
        toast.success("Account created! Please sign in.");
        router.push("/login");
        return;
      }
      toast.success("Welcome to Corium!");
      router.push("/account");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create Your Account"
      subtitle="Join Corium for faster checkout, order tracking and exclusive offers."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Full Name" error={errors.name?.message}>
          <input className={inputClass} placeholder="Your full name" {...register("name")} />
        </FormField>
        <FormField label="Email Address" error={errors.email?.message}>
          <input type="email" className={inputClass} placeholder="you@example.com" {...register("email")} />
        </FormField>
        <FormField label="Phone Number" error={errors.phone?.message}>
          <input type="tel" className={inputClass} placeholder="+91 98765 43210" {...register("phone")} />
        </FormField>
        <FormField label="Password" error={errors.password?.message}>
          <input type="password" className={inputClass} placeholder="At least 8 characters" {...register("password")} />
        </FormField>
        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
        <p className="text-center text-xs text-black/40">
          By creating an account, you agree to our{" "}
          <Link href="/terms-and-conditions" className="underline">Terms</Link> and{" "}
          <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.
        </p>
      </form>
    </AuthShell>
  );
}
