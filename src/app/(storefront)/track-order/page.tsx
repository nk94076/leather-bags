"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FormField, inputClass } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { OrderTrackingTimeline } from "@/components/account/order-tracking-timeline";
import { formatDate, formatPrice } from "@/lib/utils";

interface TrackResult {
  orderNumber: string;
  status: string;
  createdAt: string;
  trackingNumber: string | null;
  trackingHistory: { status: string; date: string; note: string }[];
  itemCount: number;
  total: number;
  city: string;
  state: string;
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    const res = await fetch("/api/track-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setResult(data);
  }

  return (
    <div className="py-10 sm:py-14">
      <Container className="max-w-2xl">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Track Order" }]} />
        <h1 className="mb-3 mt-4 font-display text-3xl text-brand-ink sm:text-4xl">Track Your Order</h1>
        <p className="mb-10 text-sm text-black/60">
          Enter your order number and the email address used at checkout to view your order status.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-6 sm:p-8">
          <FormField label="Order Number">
            <input
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. MC202601011234"
              className={inputClass}
            />
          </FormField>
          <FormField label="Email Address">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </FormField>
          <Button type="submit" disabled={loading} className="mt-2 self-start">
            <Search size={15} /> {loading ? "Searching..." : "Track Order"}
          </Button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>

        {result && (
          <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display text-xl text-brand-ink">#{result.orderNumber}</p>
                <p className="text-xs text-black/50">
                  Placed {formatDate(result.createdAt)} • {result.itemCount} item{result.itemCount > 1 ? "s" : ""} •{" "}
                  {formatPrice(result.total)}
                </p>
                {result.city && (
                  <p className="text-xs text-black/50">
                    Shipping to {result.city}, {result.state}
                  </p>
                )}
              </div>
              <OrderStatusBadge status={result.status} />
            </div>
            <OrderTrackingTimeline history={result.trackingHistory} />
          </div>
        )}
      </Container>
    </div>
  );
}
