"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { discountPercent, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart-store";
import type { ProductCardData } from "@/types/catalog";

export function ProductListItem({ product }: { product: ProductCardData }) {
  const addItem = useCartStore((s) => s.addItem);
  const discount = discountPercent(product.price, product.compareAtPrice);
  const image = product.images[0];

  return (
    <div className="flex gap-5 rounded-2xl border border-black/5 bg-white p-4 transition hover:shadow-luxury sm:gap-6 sm:p-5">
      <Link href={`/product/${product.slug}`} className="relative aspect-[4/5] w-32 shrink-0 overflow-hidden rounded-xl bg-brand-cream-dark sm:w-44">
        {image && <Image src={image.url} alt={image.altText} fill sizes="200px" className="object-cover" />}
        {discount > 0 && (
          <Badge variant="gold" className="absolute left-2 top-2">
            {discount}% Off
          </Badge>
        )}
      </Link>
      <div className="flex flex-1 flex-col">
        <span className="text-[11px] font-medium uppercase tracking-wider text-brand-primary">{product.category.name}</span>
        <Link href={`/product/${product.slug}`} className="mt-1 font-display text-lg text-brand-ink hover:text-brand-primary">
          {product.name}
        </Link>
        <Rating value={product.avgRating} count={product.reviewCount} className="mt-1" />
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-semibold text-brand-ink">{formatPrice(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-sm text-black/40 line-through">{formatPrice(product.compareAtPrice)}</span>
          )}
        </div>
        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          <button
            onClick={() => {
              addItem({
                productId: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                image: image?.url ?? "",
                quantity: 1,
                stock: product.stock,
              });
              toast.success(`${product.name} added to cart`);
            }}
            disabled={product.stock === 0}
            className="rounded-full bg-brand-ink px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-brand-secondary disabled:opacity-50"
          >
            {product.stock === 0 ? "Sold Out" : "Add to Cart"}
          </button>
          <Link
            href={`/product/${product.slug}`}
            className="rounded-full border border-black/10 px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-brand-ink transition hover:bg-brand-cream"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
