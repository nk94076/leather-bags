"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { FormField, inputClass } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { AdminCard } from "@/components/admin/admin-ui";
import { placeholderUrl } from "@/lib/placeholder";

export function InstagramEditor({
  initialTitle,
  initialSubtitle,
  initialImages,
}: {
  initialTitle: string;
  initialSubtitle: string;
  initialImages: string[];
}) {
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [images, setImages] = useState(initialImages);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/admin/homepage-sections/instagram", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, subtitle, content: { images } }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not save");
      return;
    }
    toast.success("Instagram gallery updated");
  }

  return (
    <AdminCard>
      <h2 className="mb-4 font-display text-lg text-brand-ink">Instagram Gallery</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Section Title">
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
        </FormField>
        <FormField label="Section Subtitle">
          <input className={inputClass} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        </FormField>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-8">
        {images.map((src, i) => (
          <div key={i} className="group relative aspect-square overflow-hidden rounded-lg bg-brand-cream-dark">
            <Image src={src} alt="" fill sizes="120px" className="object-cover" />
            <button
              onClick={() => setImages(images.filter((_, idx) => idx !== i))}
              className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => setImages([...images, placeholderUrl("gallery", `insta-${Date.now()}`, { w: 500, h: 500 })])}
        className="mt-3 flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline"
      >
        <Plus size={13} /> Add Image
      </button>

      <Button size="sm" onClick={handleSave} disabled={saving} className="mt-5">
        {saving ? "Saving..." : "Save"}
      </Button>
    </AdminCard>
  );
}
