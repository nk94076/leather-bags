"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      toast.success("You're subscribed! Welcome to Corium.");
      setEmail("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md items-center gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        className={
          dark
            ? "w-full rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-brand-gold"
            : "w-full rounded-full border border-black/10 bg-white px-5 py-3 text-sm text-brand-ink placeholder:text-black/40 outline-none focus:border-brand-primary"
        }
      />
      <button
        type="submit"
        disabled={loading}
        aria-label="Subscribe"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white transition hover:bg-brand-primary-dark disabled:opacity-50"
      >
        <ArrowRight size={18} />
      </button>
    </form>
  );
}
