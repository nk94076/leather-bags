"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import slugify from "slugify";
import { Wand2, Upload } from "lucide-react";
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof CategoryFormValues>(key: K, value: CategoryFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function generateImages() {
    const seed = values.slug || slugify(values.name || "category", { lower: true, strict: true });
    set("imageUrl", placeholderUrl("category", seed, { w: 900, h: 1200 }));
    set("bannerUrl", placeholderUrl("banner", `${seed}-banner`, { w: 1600, h: 500 }));
  }

  async function uploadFile(file: File, field: "imageUrl" | "bannerUrl") {
    const setUploading = field === "imageUrl" ? setUploadingImage : setUploadingBanner;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "categories");
    formData.append("altText", values.name || file.name);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      toast.error(data.error ?? "Upload failed");
      return;
    }
    set(field, data.url);
    toast.success("Image uploaded");
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
          <Wand2 size={13} /> Generate Placeholder
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <p className="text-xs text-black/50">Card / Thumbnail Image</p>
          {values.imageUrl && (
            <Image src={values.imageUrl} alt="" width={128} height={160} className="h-32 w-24 rounded-lg object-cover" />
          )}
          <label className="flex w-fit cursor-pointer items-center gap-1 text-xs font-medium text-brand-primary hover:underline">
            <Upload size={13} /> {uploadingImage ? "Uploading..." : "Upload Image"}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              disabled={uploadingImage}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadFile(file, "imageUrl");
                if (imageInputRef.current) imageInputRef.current.value = "";
              }}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs text-black/50">Banner Image (category page hero)</p>
          {values.bannerUrl && (
            <Image src={values.bannerUrl} alt="" width={200} height={80} className="h-20 w-full max-w-[200px] rounded-lg object-cover" />
          )}
          <label className="flex w-fit cursor-pointer items-center gap-1 text-xs font-medium text-brand-primary hover:underline">
            <Upload size={13} /> {uploadingBanner ? "Uploading..." : "Upload Banner"}
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              disabled={uploadingBanner}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadFile(file, "bannerUrl");
                if (bannerInputRef.current) bannerInputRef.current.value = "";
              }}
              className="hidden"
            />
          </label>
        </div>
      </div>

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
