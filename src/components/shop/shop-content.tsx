"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";
import { FilterSidebar, type FilterCategory } from "@/components/shop/filter-sidebar";
import { ShopToolbar } from "@/components/shop/shop-toolbar";
import { ShopPagination } from "@/components/shop/pagination";
import { ProductCard } from "@/components/ui/product-card";
import { ProductListItem } from "@/components/shop/product-list-item";
import type { ProductCardData } from "@/types/catalog";

export function ShopContent({
  basePath,
  categories,
  lockedCategory,
  products,
  total,
  totalPages,
  page,
}: {
  basePath: string;
  categories: FilterCategory[];
  lockedCategory?: string;
  products: ProductCardData[];
  total: number;
  totalPages: number;
  page: number;
}) {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "grid";
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const searchParamsObj: Record<string, string | undefined> = Object.fromEntries(searchParams.entries());

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <div className="hidden lg:block">
        <FilterSidebar categories={categories} basePath={basePath} lockedCategory={lockedCategory} />
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-lg">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
                <X size={20} />
              </button>
            </div>
            <FilterSidebar categories={categories} basePath={basePath} lockedCategory={lockedCategory} />
          </div>
        </div>
      )}

      <div className="flex-1">
        <ShopToolbar basePath={basePath} total={total} onOpenFilters={() => setMobileFiltersOpen(true)} />

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <p className="font-display text-xl text-brand-ink">No products found</p>
            <p className="text-sm text-black/50">Try adjusting your filters or search terms.</p>
          </div>
        ) : view === "list" ? (
          <div className="flex flex-col gap-4">
            {products.map((p) => (
              <ProductListItem key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        <ShopPagination basePath={basePath} searchParams={searchParamsObj} page={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
