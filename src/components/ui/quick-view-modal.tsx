"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { Rating } from "@/components/ui/rating";
import { Button, LinkButton } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import type { ProductCardData } from "@/types/catalog";

export function QuickViewModal({
  product,
  onClose,
}: {
  product: ProductCardData;
  onClose: () => void;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />
      <div className="relative z-10 grid w-full max-w-3xl grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-2xl sm:grid-cols-2 animate-fade-up">
        <button
          onClick={onClose}
          aria-label="Close quick view"
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-ink shadow-sm"
        >
          <X size={16} />
        </button>
        <div className="relative aspect-square bg-brand-cream-dark sm:aspect-auto">
          {product.images[0] && (
            <Image src={product.images[0].url} alt={product.images[0].altText} fill className="object-cover" />
          )}
        </div>
        <div className="flex flex-col gap-3 p-6 sm:p-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
            {product.category.name}
          </span>
          <h3 className="font-display text-2xl text-brand-ink">{product.name}</h3>
          <Rating value={product.avgRating} count={product.reviewCount} />
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold text-brand-ink">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-black/40 line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>

          {product.colors.length > 0 && (
            <div className="flex items-center gap-2">
              {product.colors.map((c) => (
                <span
                  key={c.name}
                  title={c.name}
                  className="h-6 w-6 rounded-full border border-black/10"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          )}

          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-black/10">
              <button className="px-3 py-2" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                −
              </button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button className="px-3 py-2" onClick={() => setQty((q) => q + 1)}>
                +
              </button>
            </div>
            <Button
              className="flex-1"
              disabled={product.stock === 0}
              onClick={() => {
                addItem({
                  productId: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  image: product.images[0]?.url ?? "",
                  quantity: qty,
                  stock: product.stock,
                });
                toast.success(`${product.name} added to cart`);
                onClose();
              }}
            >
              {product.stock === 0 ? "Sold Out" : "Add to Cart"}
            </Button>
          </div>

          <LinkButton href={`/product/${product.slug}`} variant="outline" className="mt-1">
            View Full Details
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
