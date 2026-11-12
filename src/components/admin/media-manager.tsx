"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, Trash2, Copy } from "lucide-react";
import { AdminCard } from "@/components/admin/admin-ui";

export interface MediaAssetData {
  id: string;
  url: string;
  altText: string;
  folder: string;
}

export function MediaManager({ assets }: { assets: MediaAssetData[] }) {
  const router = useRouter();
  const [items, setItems] = useState(assets);
  const [uploading, setUploading] = useState(false);
  const [folder, setFolder] = useState("general");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const folders = Array.from(new Set(items.map((i) => i.folder)));

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    formData.append("altText", file.name);

    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      toast.error(data.error ?? "Upload failed");
      return;
    }
    toast.success("Image uploaded");
    setItems([data, ...items]);
    router.refresh();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Could not delete");
      return;
    }
    setItems(items.filter((i) => i.id !== id));
    toast.success("Image removed");
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminCard>
        <h2 className="mb-4 font-display text-lg text-brand-ink">Upload New Image</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            placeholder="Folder (e.g. products)"
            className="w-48 rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-brand-primary"
            list="folder-suggestions"
          />
          <datalist id="folder-suggestions">
            {folders.map((f) => (
              <option key={f} value={f} />
            ))}
          </datalist>
          <label className="flex cursor-pointer items-center gap-2 rounded-full bg-brand-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-white hover:bg-brand-primary-dark">
            <Upload size={14} /> {uploading ? "Uploading..." : "Choose Image"}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
          </label>
          <span className="text-xs text-black/40">JPG, PNG, WebP, GIF or SVG · Max 5MB</span>
        </div>
      </AdminCard>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((item) => (
          <div key={item.id} className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white">
            <div className="relative aspect-square">
              <Image src={item.url} alt={item.altText} fill sizes="200px" className="object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                <button onClick={() => copyUrl(item.url)} className="rounded-full bg-white p-2 text-brand-ink" aria-label="Copy URL">
                  <Copy size={14} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="rounded-full bg-white p-2 text-red-500" aria-label="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="p-2">
              <p className="truncate text-[11px] text-black/50">{item.folder}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
