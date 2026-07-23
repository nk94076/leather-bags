"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Trash2, Wand2 } from "lucide-react";
import { FormField, inputClass } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { COLOR_PALETTE, LEATHER_TYPES } from "@/lib/constants";
import { placeholderUrl } from "@/lib/placeholder";
import slugify from "slugify";

export interface ProductFormValues {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  leatherType: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  colors: { name: string; hex: string }[];
  shortDescription: string;
  description: string;
  dimensions: string;
  weight: string;
  warranty: string;
  careInstructions: string;
  isFeatured: boolean;
  isTrending: boolean;
  isLatest: boolean;
  isActive: boolean;
  metaTitle: string;
  metaDesc: string;
  images: { url: string; altText: string }[];
}

export function ProductForm({
  categories,
  initial,
}: {
  categories: { id: string; name: string }[];
  initial?: ProductFormValues;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(
    initial ?? {
      name: "",
      slug: "",
      sku: "",
      categoryId: categories[0]?.id ?? "",
      leatherType: LEATHER_TYPES[0],
      price: 0,
      compareAtPrice: null,
      stock: 0,
      colors: [],
      shortDescription: "",
      description: "",
      dimensions: "",
      weight: "",
      warranty: "2-Year Craftsmanship Warranty",
      careInstructions: "",
      isFeatured: false,
      isTrending: false,
      isLatest: false,
      isActive: true,
      metaTitle: "",
      metaDesc: "",
      images: [],
    }
  );
  const [saving, setSaving] = useState(false);

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function toggleColor(c: { name: string; hex: string }) {
    const exists = values.colors.some((col) => col.name === c.name);
    set("colors", exists ? values.colors.filter((col) => col.name !== c.name) : [...values.colors, c]);
  }

  function generatePlaceholderImages() {
    const seed = values.slug || slugify(values.name || "product", { lower: true, strict: true });
    const newImages = [0, 1, 2].map((i) => ({
      url: placeholderUrl("product", `${seed}-${i}`, { w: 1000, h: 1250, label: values.name }),
      altText: `${values.name} - view ${i + 1}`,
    }));
    set("images", newImages);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (values.images.length === 0) {
      toast.error("Add at least one product image");
      return;
    }
    if (values.colors.length === 0) {
      toast.error("Select at least one colour");
      return;
    }
    setSaving(true);
    const endpoint = initial?.id ? `/api/admin/products/${initial.id}` : "/api/admin/products";
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
    toast.success(initial?.id ? "Product updated" : "Product created");
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-5 rounded-2xl border border-black/5 bg-white p-6 lg:col-span-2">
          <h2 className="font-display text-lg text-brand-ink">Basic Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Product Name">
              <input required className={inputClass} value={values.name} onChange={(e) => set("name", e.target.value)} />
            </FormField>
            <FormField label="URL Slug">
              <input
                className={inputClass}
                placeholder="auto-generated from name"
                value={values.slug}
                onChange={(e) => set("slug", e.target.value)}
              />
            </FormField>
            <FormField label="SKU">
              <input required className={inputClass} value={values.sku} onChange={(e) => set("sku", e.target.value)} />
            </FormField>
            <FormField label="Category">
              <select className={inputClass} value={values.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Short Description">
            <textarea
              required
              rows={2}
              className={inputClass}
              value={values.shortDescription}
              onChange={(e) => set("shortDescription", e.target.value)}
            />
          </FormField>
          <FormField label="Full Description">
            <textarea
              required
              rows={5}
              className={inputClass}
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </FormField>

          <h2 className="mt-2 font-display text-lg text-brand-ink">Pricing & Inventory</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label="Price (₹)">
              <input
                required
                type="number"
                min={0}
                className={inputClass}
                value={values.price}
                onChange={(e) => set("price", Number(e.target.value))}
              />
            </FormField>
            <FormField label="Compare-at Price (₹)">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={values.compareAtPrice ?? ""}
                onChange={(e) => set("compareAtPrice", e.target.value ? Number(e.target.value) : null)}
              />
            </FormField>
            <FormField label="Stock Quantity">
              <input
                required
                type="number"
                min={0}
                className={inputClass}
                value={values.stock}
                onChange={(e) => set("stock", Number(e.target.value))}
              />
            </FormField>
          </div>

          <h2 className="mt-2 font-display text-lg text-brand-ink">Specifications</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Leather Type">
              <select className={inputClass} value={values.leatherType} onChange={(e) => set("leatherType", e.target.value)}>
                {LEATHER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Dimensions">
              <input className={inputClass} value={values.dimensions} onChange={(e) => set("dimensions", e.target.value)} />
            </FormField>
            <FormField label="Weight">
              <input className={inputClass} value={values.weight} onChange={(e) => set("weight", e.target.value)} />
            </FormField>
            <FormField label="Warranty">
              <input className={inputClass} value={values.warranty} onChange={(e) => set("warranty", e.target.value)} />
            </FormField>
          </div>
          <FormField label="Care Instructions">
            <textarea rows={2} className={inputClass} value={values.careInstructions} onChange={(e) => set("careInstructions", e.target.value)} />
          </FormField>

          <h2 className="mt-2 font-display text-lg text-brand-ink">Colours</h2>
          <div className="flex flex-wrap gap-3">
            {COLOR_PALETTE.map((c) => (
              <button
                type="button"
                key={c.name}
                onClick={() => toggleColor(c)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                  values.colors.some((col) => col.name === c.name) ? "border-brand-primary bg-brand-cream" : "border-black/10"
                }`}
              >
                <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                {c.name}
              </button>
            ))}
          </div>

          <h2 className="mt-2 font-display text-lg text-brand-ink">SEO</h2>
          <FormField label="Meta Title">
            <input className={inputClass} value={values.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} />
          </FormField>
          <FormField label="Meta Description">
            <textarea rows={2} className={inputClass} value={values.metaDesc} onChange={(e) => set("metaDesc", e.target.value)} />
          </FormField>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-black/5 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg text-brand-ink">Images</h2>
              <button type="button" onClick={generatePlaceholderImages} className="flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline">
                <Wand2 size={13} /> Generate
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {values.images.map((img, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Image src={img.url} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                  <input
                    className={inputClass}
                    value={img.altText}
                    onChange={(e) => {
                      const next = [...values.images];
                      next[i] = { ...next[i], altText: e.target.value };
                      set("images", next);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => set("images", values.images.filter((_, idx) => idx !== i))}
                    className="text-black/30 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {values.images.length === 0 && (
                <p className="text-xs text-black/40">No images yet. Click Generate to add placeholder photography.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-6">
            <h2 className="mb-4 font-display text-lg text-brand-ink">Visibility</h2>
            <div className="flex flex-col gap-3 text-sm">
              <Toggle label="Active (visible on storefront)" checked={values.isActive} onChange={(v) => set("isActive", v)} />
              <Toggle label="Featured Product" checked={values.isFeatured} onChange={(v) => set("isFeatured", v)} />
              <Toggle label="Trending Product" checked={values.isTrending} onChange={(v) => set("isTrending", v)} />
              <Toggle label="Latest Product" checked={values.isLatest} onChange={(v) => set("isLatest", v)} />
            </div>
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Saving..." : initial?.id ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-black/70">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-brand-primary" />
    </label>
  );
}
