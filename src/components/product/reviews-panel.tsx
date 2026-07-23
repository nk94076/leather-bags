"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Rating } from "@/components/ui/rating";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { placeholderUrl } from "@/lib/placeholder";

export interface ReviewData {
  id: string;
  authorName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  adminReply?: string | null;
}

export function ReviewsPanel({ productId, reviews, avgRating }: { productId: string; reviews: ReviewData[]; avgRating: number }) {
  const { status } = useSession();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (status !== "authenticated") {
      toast.error("Please sign in to write a review");
      router.push("/login");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, title, comment }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error ?? "Something went wrong");
      return;
    }
    toast.success("Thanks! Your review is pending approval.");
    setShowForm(false);
    setTitle("");
    setComment("");
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-display text-3xl text-brand-ink">{avgRating.toFixed(1)}</span>
          <div>
            <Rating value={avgRating} size={16} />
            <p className="text-xs text-black/50">Based on {reviews.length} reviews</p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowForm((s) => !s)}>
          Write a Review
        </Button>
      </div>

      {showForm && (
        <form onSubmit={submitReview} className="flex flex-col gap-4 rounded-2xl border border-black/10 p-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide">Your Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <button key={r} type="button" onClick={() => setRating(r)} aria-label={`Rate ${r} stars`}>
                  <Star size={22} className={r <= rating ? "fill-brand-gold text-brand-gold" : "text-black/20"} />
                </button>
              ))}
            </div>
          </div>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Review title"
            className="rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-brand-primary"
          />
          <textarea
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={4}
            minLength={10}
            className="rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-brand-primary"
          />
          <Button type="submit" disabled={submitting} className="self-start">
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      )}

      <div className="flex flex-col gap-6">
        {reviews.length === 0 && <p className="text-sm text-black/50">No reviews yet. Be the first to review this product.</p>}
        {reviews.map((r) => (
          <div key={r.id} className="flex gap-4 border-b border-black/5 pb-6">
            <Image
              src={placeholderUrl("avatar", r.id, { label: r.authorName, w: 44 })}
              alt={r.authorName}
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 rounded-full"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-brand-ink">{r.authorName}</p>
                <span className="text-xs text-black/40">{formatDate(r.createdAt)}</span>
              </div>
              <Rating value={r.rating} className="my-1.5" />
              <p className="text-sm font-medium text-brand-ink">{r.title}</p>
              <p className="mt-1 text-sm text-black/60">{r.comment}</p>
              {r.adminReply && (
                <div className="mt-3 rounded-xl bg-brand-cream p-3 text-xs text-black/60">
                  <span className="font-semibold text-brand-ink">Corium Team: </span>
                  {r.adminReply}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
