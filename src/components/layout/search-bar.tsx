"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface SuggestionProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
}
interface SuggestionCategory {
  name: string;
  slug: string;
}

export function SearchBar({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<SuggestionProduct[]>([]);
  const [categories, setCategories] = useState<SuggestionCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setProducts([]);
      setCategories([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setProducts(data.products ?? []);
        setCategories(data.categories ?? []);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function goToResults() {
    if (!query.trim()) return;
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
    onClose();
  }

  const hasSuggestions = products.length > 0 || categories.length > 0;

  return (
    <div className="border-t border-black/5 bg-white animate-fade-in">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            goToResults();
          }}
          className="flex items-center gap-3 py-4"
        >
          <Search size={18} className="text-black/40" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Search for bags, backpacks, wallets..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-black/40"
          />
          <button type="button" onClick={onClose} aria-label="Close search">
            <X size={18} className="text-black/40" />
          </button>
        </form>

        {query.trim().length >= 2 && (
          <div className="max-h-[70vh] overflow-y-auto pb-6">
            {loading && products.length === 0 && categories.length === 0 ? (
              <p className="py-4 text-sm text-black/40">Searching...</p>
            ) : hasSuggestions ? (
              <div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
                {categories.length > 0 && (
                  <div className="sm:w-52">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">Categories</p>
                    <div className="flex flex-col gap-1">
                      {categories.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/shop/${c.slug}`}
                          onClick={onClose}
                          className="rounded-lg px-2 py-1.5 text-sm text-brand-ink hover:bg-brand-cream"
                        >
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {products.length > 0 && (
                  <div className="flex-1">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">Products</p>
                    <div className="flex flex-col gap-1">
                      {products.map((p) => (
                        <Link
                          key={p.id}
                          href={`/product/${p.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-brand-cream"
                        >
                          <div className="relative h-11 w-10 shrink-0 overflow-hidden rounded-lg bg-brand-cream-dark">
                            {p.image && <Image src={p.image} alt={p.name} fill sizes="44px" className="object-cover" />}
                          </div>
                          <span className="flex-1 text-sm text-brand-ink">{p.name}</span>
                          <span className="text-sm text-black/50">{formatPrice(p.price)}</span>
                        </Link>
                      ))}
                    </div>
                    <button
                      onClick={goToResults}
                      className="mt-3 flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline"
                    >
                      View all results for &ldquo;{query}&rdquo; <ArrowRight size={12} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="py-4 text-sm text-black/40">No results for &ldquo;{query}&rdquo;</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
