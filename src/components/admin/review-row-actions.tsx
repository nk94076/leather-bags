"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, MessageSquare } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";

export function ReviewRowActions({ id, status, adminReply }: { id: string; status: string; adminReply: string | null }) {
  const router = useRouter();
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState(adminReply ?? "");
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: "APPROVED" | "REJECTED") {
    setLoading(true);
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error("Could not update review");
      return;
    }
    toast.success(`Review ${newStatus.toLowerCase()}`);
    router.refresh();
  }

  async function submitReply() {
    setLoading(true);
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminReply: reply }),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error("Could not save reply");
      return;
    }
    toast.success("Reply saved");
    setReplying(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {status !== "APPROVED" && (
          <button onClick={() => updateStatus("APPROVED")} disabled={loading} className="flex items-center gap-1 text-xs font-medium text-green-700 hover:underline">
            <Check size={13} /> Approve
          </button>
        )}
        {status !== "REJECTED" && (
          <button onClick={() => updateStatus("REJECTED")} disabled={loading} className="flex items-center gap-1 text-xs font-medium text-red-600 hover:underline">
            <X size={13} /> Reject
          </button>
        )}
        <button onClick={() => setReplying((r) => !r)} className="flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline">
          <MessageSquare size={13} /> Reply
        </button>
        <DeleteButton endpoint={`/api/admin/reviews/${id}`} confirmMessage="Delete this review?" />
      </div>
      {replying && (
        <div className="flex gap-2">
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Write a reply..."
            className="w-full rounded-lg border border-black/10 px-3 py-1.5 text-xs"
          />
          <button onClick={submitReply} disabled={loading} className="rounded-lg bg-brand-ink px-3 py-1.5 text-xs text-white">
            Save
          </button>
        </div>
      )}
    </div>
  );
}
