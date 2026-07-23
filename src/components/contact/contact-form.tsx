"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FormField, inputClass } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z.string().trim().optional(),
  subject: z.string().trim().min(2, "Enter a subject"),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
});
type FormValues = z.infer<typeof schema>;

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const res = await fetch("/api/contact", {
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
    toast.success("Message sent! We'll get back to you within 1 business day.");
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Full Name" error={errors.name?.message}>
          <input className={inputClass} placeholder="Your name" {...register("name")} />
        </FormField>
        <FormField label="Email Address" error={errors.email?.message}>
          <input type="email" className={inputClass} placeholder="you@example.com" {...register("email")} />
        </FormField>
      </div>
      <FormField label="Phone Number (Optional)">
        <input className={inputClass} placeholder="+91 98765 43210" {...register("phone")} />
      </FormField>
      <FormField label="Subject" error={errors.subject?.message}>
        <input className={inputClass} placeholder="How can we help?" {...register("subject")} />
      </FormField>
      <FormField label="Message" error={errors.message?.message}>
        <textarea rows={5} className={inputClass} placeholder="Tell us more..." {...register("message")} />
      </FormField>
      <Button type="submit" disabled={loading} className="mt-2 self-start">
        {loading ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
