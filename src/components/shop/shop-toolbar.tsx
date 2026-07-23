"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { SORT_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ShopToolbar({
  basePath,
  total,
  onOpenFilters,
}: {
  basePath: string;
  total: number;
  onOpenFilters: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "grid";
  const sort = searchParams.get("sort") ?? "featured";

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    if (key === "sort") params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenFilters}
          className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2.5 text-xs font-medium uppercase tracking-wide lg:hidden"
        >
          <SlidersHorizontal size={14} /> Filters
        </button>
        <p className="text-sm text-black/50">{total} products</p>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={sort}
          onChange={(e) => setParam("sort", e.target.value)}
          className="rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs font-medium uppercase tracking-wide outline-none"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="hidden items-center gap-1 rounded-full border border-black/10 p-1 sm:flex">
          <button
            onClick={() => setParam("view", "grid")}
            aria-label="Grid view"
            className={cn("flex h-8 w-8 items-center justify-center rounded-full", view === "grid" && "bg-brand-ink text-white")}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => setParam("view", "list")}
            aria-label="List view"
            className={cn("flex h-8 w-8 items-center justify-center rounded-full", view === "list" && "bg-brand-ink text-white")}
          >
            <List size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
