"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ReviewsPanel, type ReviewData } from "@/components/product/reviews-panel";

export interface SpecRow {
  label: string;
  value: string;
}

export function ProductTabs({
  description,
  specs,
  reviews,
  productId,
  avgRating,
}: {
  description: string;
  specs: SpecRow[];
  reviews: ReviewData[];
  productId: string;
  avgRating: number;
}) {
  const [tab, setTab] = useState<"description" | "specs" | "reviews">("description");

  return (
    <div id="reviews" className="scroll-mt-24">
      <div className="flex gap-8 border-b border-black/10">
        {[
          { id: "description", label: "Description" },
          { id: "specs", label: "Specifications" },
          { id: "reviews", label: `Reviews (${reviews.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={cn(
              "relative pb-4 text-sm font-medium uppercase tracking-wide transition",
              tab === t.id ? "text-brand-ink" : "text-black/40 hover:text-black/60"
            )}
          >
            {t.label}
            {tab === t.id && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-primary" />}
          </button>
        ))}
      </div>

      <div className="py-8">
        {tab === "description" && (
          <p className="max-w-3xl text-sm leading-relaxed text-black/70">{description}</p>
        )}
        {tab === "specs" && (
          <dl className="grid max-w-2xl grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {specs.map((s) => (
              <div key={s.label} className="flex justify-between border-b border-black/5 pb-3">
                <dt className="text-sm text-black/50">{s.label}</dt>
                <dd className="text-sm font-medium text-brand-ink">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {tab === "reviews" && <ReviewsPanel productId={productId} reviews={reviews} avgRating={avgRating} />}
      </div>
    </div>
  );
}
