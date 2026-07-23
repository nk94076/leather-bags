"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Wand2 } from "lucide-react";
import { FormField, inputClass } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { AdminCard } from "@/components/admin/admin-ui";
import { placeholderUrl } from "@/lib/placeholder";

export interface BannerData {
  id: string;
  placement: string;
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export function BannerManager({ placement, label, banners }: { placement: string; label: string; banners: BannerData[] }) {
  const router = useRouter();
  const [items, setItems] = useState(banners);

  function addNew() {
    setItems([
      ...items,
      {
        id: `new-${Date.now()}`,
        placement,
        title: "New Banner",
        subtitle: "",
        ctaLabel: "Shop Now",
        ctaUrl: "/shop",
        imageUrl: placeholderUrl("banner", `${placement}-${Date.now()}`, { w: 1600, h: 800 }),
        sortOrder: items.length,
        isActive: true,
      },
    ]);
  }

  return (
    <AdminCard>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg text-brand-ink">{label}</h2>
        <button onClick={addNew} className="flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline">
          <Plus size={13} /> Add Slide
        </button>
      </div>
      <div className="flex flex-col gap-6">
        {items.map((b, i) => (
          <BannerRow
            key={b.id}
            banner={b}
            onDeleted={() => setItems(items.filter((x) => x.id !== b.id))}
            onSaved={(saved) => {
              const next = [...items];
              next[i] = saved;
              setItems(next);
              router.refresh();
            }}
          />
        ))}
        {items.length === 0 && <p className="text-sm text-black/40">No banners yet.</p>}
      </div>
    </AdminCard>
  );
}

function BannerRow({ banner, onSaved, onDeleted }: { banner: BannerData; onSaved: (b: BannerData) => void; onDeleted: () => void }) {
  const [values, setValues] = useState(banner);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof BannerData>(key: K, value: BannerData[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function regenerateImage() {
    set("imageUrl", placeholderUrl("banner", `${values.placement}-${Date.now()}`, { w: 1600, h: 800 }));
  }

  async function handleSave() {
    setSaving(true);
    const isNew = values.id.startsWith("new-");
    const res = await fetch(isNew ? "/api/admin/banners" : `/api/admin/banners/${values.id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not save banner");
      return;
    }
    toast.success("Banner saved");
    onSaved(data);
  }

  async function handleDelete() {
    if (!values.id.startsWith("new-")) {
      const res = await fetch(`/api/admin/banners/${values.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Could not delete banner");
        return;
      }
    }
    toast.success("Banner removed");
    onDeleted();
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-black/10 p-4 sm:flex-row">
      <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg bg-brand-cream-dark sm:w-48">
        <Image src={values.imageUrl} alt={values.title} fill sizes="200px" className="object-cover" />
        <button
          onClick={regenerateImage}
          className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium"
        >
          <Wand2 size={11} /> New Image
        </button>
      </div>
      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Title">
          <input className={inputClass} value={values.title} onChange={(e) => set("title", e.target.value)} />
        </FormField>
        <FormField label="Subtitle">
          <input className={inputClass} value={values.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} />
        </FormField>
        <FormField label="CTA Label">
          <input className={inputClass} value={values.ctaLabel ?? ""} onChange={(e) => set("ctaLabel", e.target.value)} />
        </FormField>
        <FormField label="CTA URL">
          <input className={inputClass} value={values.ctaUrl ?? ""} onChange={(e) => set("ctaUrl", e.target.value)} />
        </FormField>
        <div className="flex items-center gap-4 sm:col-span-2">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
          <button onClick={handleDelete} className="flex items-center gap-1 text-xs text-red-500 hover:underline">
            <Trash2 size={13} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}
