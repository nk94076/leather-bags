"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";
import { COLOR_PALETTE, LEATHER_TYPES, PRICE_MAX } from "@/lib/constants";
import { Rating } from "@/components/ui/rating";

export interface FilterCategory {
  name: string;
  slug: string;
}

export function FilterSidebar({
  categories,
  basePath,
  lockedCategory,
}: {
  categories: FilterCategory[];
  basePath: string;
  lockedCategory?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function currentList(key: string) {
    return (searchParams.get(key) ?? "").split(",").filter(Boolean);
  }

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  }

  function toggleListValue(key: string, value: string) {
    const list = currentList(key);
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    updateParam(key, next.join(","));
  }

  const selectedCategories = lockedCategory ? [lockedCategory] : currentList("category");
  const selectedColors = currentList("color");
  const selectedMaterials = currentList("material");
  const availability = searchParams.get("availability") ?? "";
  const rating = searchParams.get("rating") ?? "";
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  function applyPrice() {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  }

  const hasActiveFilters =
    selectedColors.length > 0 ||
    selectedMaterials.length > 0 ||
    availability ||
    rating ||
    minPrice ||
    maxPrice ||
    (!lockedCategory && selectedCategories.length > 0);

  return (
    <aside className="flex w-full flex-col gap-8 lg:w-72 lg:shrink-0">
      {hasActiveFilters && (
        <button
          onClick={() => router.push(basePath)}
          className="flex items-center gap-1 self-start text-xs font-medium text-brand-primary hover:underline"
        >
          <X size={13} /> Clear All Filters
        </button>
      )}

      {!lockedCategory && (
        <FilterGroup title="Category">
          {categories.map((c) => (
            <FilterCheckbox
              key={c.slug}
              label={c.name}
              checked={selectedCategories.includes(c.slug)}
              onChange={() => toggleListValue("category", c.slug)}
            />
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Price Range">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={applyPrice}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-xs"
          />
          <span className="text-black/30">–</span>
          <input
            type="number"
            min={0}
            placeholder={`Max ${PRICE_MAX}`}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={applyPrice}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-xs"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Leather Material">
        {LEATHER_TYPES.map((m) => (
          <FilterCheckbox
            key={m}
            label={m}
            checked={selectedMaterials.includes(m)}
            onChange={() => toggleListValue("material", m)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Colour">
        <div className="flex flex-wrap gap-2">
          {COLOR_PALETTE.map((c) => (
            <button
              key={c.name}
              title={c.name}
              onClick={() => toggleListValue("color", c.name)}
              className={`h-7 w-7 rounded-full border-2 transition ${
                selectedColors.includes(c.name) ? "border-brand-primary scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Availability">
        <FilterRadio
          label="All"
          checked={availability === ""}
          onChange={() => updateParam("availability", null)}
        />
        <FilterRadio
          label="In Stock"
          checked={availability === "in-stock"}
          onChange={() => updateParam("availability", "in-stock")}
        />
        <FilterRadio
          label="Out of Stock"
          checked={availability === "out-of-stock"}
          onChange={() => updateParam("availability", "out-of-stock")}
        />
      </FilterGroup>

      <FilterGroup title="Rating">
        {[4, 3, 2].map((r) => (
          <button
            key={r}
            onClick={() => updateParam("rating", rating === String(r) ? null : String(r))}
            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition ${
              rating === String(r) ? "bg-brand-cream-dark" : "hover:bg-brand-cream"
            }`}
          >
            <Rating value={r} size={13} />
            <span className="text-xs text-black/60">&amp; Up</span>
          </button>
        ))}
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-black/5 pb-6 last:border-0">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-ink">{title}</h3>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function FilterCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-black/70">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-brand-primary" />
      {label}
    </label>
  );
}

function FilterRadio({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-black/70">
      <input type="radio" checked={checked} onChange={onChange} className="h-4 w-4 accent-brand-primary" />
      {label}
    </label>
  );
}
