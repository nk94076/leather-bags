"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { FormField, inputClass } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { AdminCard } from "@/components/admin/admin-ui";

const ICON_OPTIONS = ["Gem", "Hammer", "ShieldCheck", "Truck", "RefreshCw", "Headphones", "Star", "Award", "Clock"];

interface Item {
  icon: string;
  title: string;
  text: string;
}

export function WhyChooseUsEditor({
  initialTitle,
  initialSubtitle,
  initialItems,
}: {
  initialTitle: string;
  initialSubtitle: string;
  initialItems: Item[];
}) {
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [items, setItems] = useState<Item[]>(initialItems);
  const [saving, setSaving] = useState(false);

  function updateItem(i: number, patch: Partial<Item>) {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    setItems(next);
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/admin/homepage-sections/why-choose-us", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, subtitle, content: { items } }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not save");
      return;
    }
    toast.success("Why Choose Us updated");
  }

  return (
    <AdminCard>
      <h2 className="mb-4 font-display text-lg text-brand-ink">Why Choose Us</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Section Title">
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
        </FormField>
        <FormField label="Section Subtitle">
          <input className={inputClass} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        </FormField>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-1 gap-3 rounded-xl border border-black/10 p-4 sm:grid-cols-[120px_1fr_2fr_auto]">
            <select className={inputClass} value={item.icon} onChange={(e) => updateItem(i, { icon: e.target.value })}>
              {ICON_OPTIONS.map((ic) => (
                <option key={ic} value={ic}>
                  {ic}
                </option>
              ))}
            </select>
            <input className={inputClass} value={item.title} onChange={(e) => updateItem(i, { title: e.target.value })} placeholder="Title" />
            <input className={inputClass} value={item.text} onChange={(e) => updateItem(i, { text: e.target.value })} placeholder="Description" />
            <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="self-center text-black/30 hover:text-red-500">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        <button
          onClick={() => setItems([...items, { icon: "Gem", title: "New Benefit", text: "Description here" }])}
          className="flex items-center gap-1 self-start text-xs font-medium text-brand-primary hover:underline"
        >
          <Plus size={13} /> Add Item
        </button>
      </div>

      <Button size="sm" onClick={handleSave} disabled={saving} className="mt-5">
        {saving ? "Saving..." : "Save"}
      </Button>
    </AdminCard>
  );
}
