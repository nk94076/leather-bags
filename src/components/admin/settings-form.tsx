"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FormField, inputClass } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { AdminCard } from "@/components/admin/admin-ui";

export interface SettingField {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "checkbox" | "color";
}

export function SettingsForm({
  title,
  settingKey,
  fields,
  initialValue,
}: {
  title: string;
  settingKey: string;
  fields: SettingField[];
  initialValue: Record<string, unknown>;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValue);
  const [saving, setSaving] = useState(false);

  function set(key: string, value: unknown) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: settingKey, value: values }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not save settings");
      return;
    }
    toast.success(`${title} saved`);
  }

  return (
    <AdminCard>
      <h2 className="mb-4 font-display text-lg text-brand-ink">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <FormField key={f.key} label={f.label}>
            {f.type === "checkbox" ? (
              <label className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  checked={Boolean(values[f.key])}
                  onChange={(e) => set(f.key, e.target.checked)}
                  className="h-4 w-4 accent-brand-primary"
                />
                <span className="text-sm text-black/60">Enabled</span>
              </label>
            ) : f.type === "textarea" ? (
              <textarea
                rows={2}
                className={inputClass}
                value={String(values[f.key] ?? "")}
                onChange={(e) => set(f.key, e.target.value)}
              />
            ) : f.type === "color" ? (
              <div className="flex items-center gap-2">
                <input type="color" value={String(values[f.key] ?? "#B9855A")} onChange={(e) => set(f.key, e.target.value)} className="h-10 w-14 rounded" />
                <input className={inputClass} value={String(values[f.key] ?? "")} onChange={(e) => set(f.key, e.target.value)} />
              </div>
            ) : (
              <input
                type={f.type === "number" ? "number" : "text"}
                className={inputClass}
                value={String(values[f.key] ?? "")}
                onChange={(e) => set(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
              />
            )}
          </FormField>
        ))}
      </div>
      <Button size="sm" onClick={handleSave} disabled={saving} className="mt-5">
        {saving ? "Saving..." : "Save"}
      </Button>
    </AdminCard>
  );
}
