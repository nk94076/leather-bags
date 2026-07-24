"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminCard } from "@/components/admin/admin-ui";

export function AnnouncementEditor({ initialMessages }: { initialMessages: string[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/admin/homepage-sections/announcement", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: { messages: messages.filter((m) => m.trim()) } }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not save");
      return;
    }
    toast.success("Announcement bar updated");
  }

  return (
    <AdminCard>
      <h2 className="mb-4 font-display text-lg text-brand-ink">Announcement Bar</h2>
      <div className="flex flex-col gap-3">
        {messages.map((m, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-brand-primary"
              value={m}
              onChange={(e) => {
                const next = [...messages];
                next[i] = e.target.value;
                setMessages(next);
              }}
            />
            <button onClick={() => setMessages(messages.filter((_, idx) => idx !== i))} className="text-black/30 hover:text-red-500">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        <button
          onClick={() => setMessages([...messages, "New announcement message"])}
          className="flex items-center gap-1 self-start text-xs font-medium text-brand-primary hover:underline"
        >
          <Plus size={13} /> Add Message
        </button>
        <Button size="sm" onClick={handleSave} disabled={saving} className="mt-2 self-start">
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </AdminCard>
  );
}
