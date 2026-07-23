"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField, inputClass } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";
  const adminOnly = searchParams.get("adminOnly");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast.error("Invalid email or password");
      return;
    }
    toast.success("Welcome back!");
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Sign in to continue to your Corium account."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-brand-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      {adminOnly && (
        <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Please sign in with an administrator account to access the admin panel.
        </p>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Email Address" error={errors.email?.message}>
          <input type="email" className={inputClass} placeholder="you@example.com" {...register("email")} />
        </FormField>
        <FormField label="Password" error={errors.password?.message}>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className={inputClass}
              placeholder="••••••••"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </FormField>
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs font-medium text-brand-primary hover:underline">
            Forgot Password?
          </Link>
        </div>
        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? "Signing In..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-8 rounded-xl border border-dashed border-black/15 bg-brand-cream p-4 text-xs text-black/60">
        <p className="mb-1 font-semibold text-brand-ink">Demo credentials</p>
        <p>Customer: aarav.mehta@example.com / Customer@123</p>
        <p>Admin: admin@corium-leather.com / Admin@12345</p>
      </div>
    </AuthShell>
  );
}
