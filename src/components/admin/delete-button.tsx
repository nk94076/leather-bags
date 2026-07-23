"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export function DeleteButton({
  endpoint,
  confirmMessage = "Are you sure you want to delete this item?",
  onDeleted,
}: {
  endpoint: string;
  confirmMessage?: string;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const res = await fetch(endpoint, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Could not delete");
      return;
    }
    toast.success("Deleted successfully");
    setConfirming(false);
    if (onDeleted) onDeleted();
    else router.refresh();
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-2 text-xs">
        <span className="text-black/50">{confirmMessage}</span>
        <button onClick={handleDelete} disabled={loading} className="font-semibold text-red-600 hover:underline">
          {loading ? "..." : "Confirm"}
        </button>
        <button onClick={() => setConfirming(false)} className="text-black/40 hover:underline">
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} aria-label="Delete" className="text-black/40 hover:text-red-600">
      <Trash2 size={15} />
    </button>
  );
}
