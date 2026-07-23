"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import slugify from "slugify";
import { Wand2 } from "lucide-react";
import { FormField, inputClass } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { placeholderUrl } from "@/lib/placeholder";

export interface CategoryFormValues {
  id?: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  bannerUrl: string;
  icon: string;
  metaTitle: string;
  metaDesc: string;
  sortOrder: number;
  isFeatured: boolean;
}

export function CategoryForm({ initial }: { initial?: CategoryFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState<CategoryFormValues>(
    initial ?? {
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      bannerUrl: "",
      icon: "ShoppingBag",
      metaTitle: "",
      metaDesc: "",
      sortOrder: 0,
      isFeatured: true,
    }
  );
  const [saving, setSaving] = useState(false);

  function set<K extends keyof CategoryFormValues>(key: K, value: CategoryFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function generateImages() {
    const seed = values.slug || slugify(values.name || "category", { lower: true, strict: true });
    set("imageUrl", placeholderUrl("category", seed, { w: 900, h: 1200 }));
    set("bannerUrl", placeholderUrl("banner", `${seed}-banner`, { w: 1600, h: 500 }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.imageUrl) {
      toast.error("Add a category image");
      return;
    }
    setSaving(true);
    const endpoint = initial?.id ? `/api/admin/categories/${initial.id}` : "/api/admin/categories";
    const method = initial?.id ? "PATCH" : "POST";
    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      toast.error(data.error ?? "Something went wrong");
      return;
    }
    toast.success(initial?.id ? "Category updated" : "Category created");
    router.push("/admin/categories");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5 rounded-2xl border border-black/5 bg-white p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Category Name">
          <input required className={inputClass} value={values.name} onChange={(e) => set("name", e.target.value)} />
        </FormField>
        <FormField label="URL Slug">
          <input className={inputClass} placeholder="auto-generated from name" value={values.slug} onChange={(e) => set("slug", e.target.value)} />
        </FormField>
      </div>
      <FormField label="Description">
        <textarea required rows={3} className={inputClass} value={values.description} onChange={(e) => set("description", e.target.value)} />
      </FormField>
      <FormField label="Display Order">
        <input type="number" className={inputClass} value={values.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} />
      </FormField>

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-ink">Images</span>
        <button type="button" onClick={generateImages} className="flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline">
          <Wand2 size={13} /> Generate
        </button>
      </div>
      {values.imageUrl && (
        <div className="flex gap-3">
          <Image src={values.imageUrl} alt="" width={64} height={80} className="h-20 w-16 rounded-lg object-cover" />
          {values.bannerUrl && (
            <Image src={values.bannerUrl} alt="" width={128} height={80} className="h-20 w-32 rounded-lg object-cover" />
          )}
        </div>
      )}

      <FormField label="Meta Title">
        <input className={inputClass} value={values.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} />
      </FormField>
      <FormField label="Meta Description">
        <textarea rows={2} className={inputClass} value={values.metaDesc} onChange={(e) => set("metaDesc", e.target.value)} />
      </FormField>

      <label className="flex items-center justify-between text-sm">
        <span className="text-black/70">Featured on homepage</span>
        <input type="checkbox" checked={values.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} className="h-4 w-4 accent-brand-primary" />
      </label>

      <Button type="submit" disabled={saving} className="self-start">
        {saving ? "Saving..." : initial?.id ? "Save Changes" : "Create Category"}
      </Button>
    </form>
  );
}
