"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField, inputClass } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

type Step = "email" | "otp";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error(data.error ?? "Something went wrong");
      return;
    }
    setDemoOtp(data.demoOtp ?? null);
    toast.success("If an account exists, a verification code has been sent.");
    setStep("otp");
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error(data.error ?? "Invalid or expired code");
      return;
    }
    toast.success("Password reset successfully. Please sign in.");
    router.push("/login");
  }

  return (
    <AuthShell
      title={step === "email" ? "Forgot Password" : "Verify & Reset"}
      subtitle={
        step === "email"
          ? "Enter your registered email and we'll send you a one-time verification code."
          : `Enter the 6-digit code sent to ${email} and choose a new password.`
      }
      footer={
        <Link href="/login" className="font-medium text-brand-primary hover:underline">
          Back to Sign In
        </Link>
      }
    >
      {step === "email" ? (
        <form onSubmit={requestOtp} className="flex flex-col gap-4">
          <FormField label="Email Address">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
            />
          </FormField>
          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "Sending..." : "Send Verification Code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={resetPassword} className="flex flex-col gap-4">
          {demoOtp && (
            <p className="rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800">
              No SMTP is configured in this demo environment, so your code is shown here: <strong>{demoOtp}</strong>
            </p>
          )}
          <FormField label="Verification Code">
            <input
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className={inputClass}
              placeholder="6-digit code"
            />
          </FormField>
          <FormField label="New Password">
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="At least 8 characters"
            />
          </FormField>
          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
          <button type="button" onClick={() => setStep("email")} className="text-xs text-black/50 hover:underline">
            Use a different email
          </button>
        </form>
      )}
    </AuthShell>
  );
}
