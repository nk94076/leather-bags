"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FormField, inputClass } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { AdminCard } from "@/components/admin/admin-ui";

export function SectionTextEditor({
  sectionKey,
  label,
  initialTitle,
  initialSubtitle,
  initialVisible,
}: {
  sectionKey: string;
  label: string;
  initialTitle: string;
  initialSubtitle: string;
  initialVisible: boolean;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [visible, setVisible] = useState(initialVisible);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/admin/homepage-sections/${sectionKey}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, subtitle, isVisible: visible }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not save section");
      return;
    }
    toast.success(`${label} updated`);
  }

  return (
    <AdminCard>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg text-brand-ink">{label}</h2>
        <label className="flex items-center gap-2 text-xs text-black/60">
          Visible
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="h-4 w-4 accent-brand-primary" />
        </label>
      </div>
      <div className="flex flex-col gap-4">
        <FormField label="Section Title">
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
        </FormField>
        <FormField label="Section Subtitle">
          <input className={inputClass} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        </FormField>
        <Button size="sm" onClick={handleSave} disabled={saving} className="self-start">
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </AdminCard>
  );
}
