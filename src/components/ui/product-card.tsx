"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Eye, ShoppingBag } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { cn, discountPercent, formatPrice } from "@/lib/utils";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/store/cart-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import type { ProductCardData } from "@/types/catalog";
import { QuickViewModal } from "@/components/ui/quick-view-modal";

export function ProductCard({ product }: { product: ProductCardData }) {
  const { status } = useSession();
  const addItem = useCartStore((s) => s.addItem);
  const wishlistIds = useWishlistStore((s) => s.ids);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const hydrate = useWishlistStore((s) => s.hydrate);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);

  useEffect(() => {
    if (status === "authenticated") hydrate();
  }, [status, hydrate]);

  const inWishlist = wishlistIds.has(product.id);
  const discount = discountPercent(product.price, product.compareAtPrice);
  const image = product.images[0];
  const hoverImage = product.images[1] ?? image;

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (wishBusy) return;
    setWishBusy(true);
    const result = await toggleWishlist(product.id);
    setWishBusy(false);
    if (result === "auth-required") {
      toast.error("Please sign in to save items to your wishlist");
      return;
    }
    toast.success(result === "added" ? "Added to wishlist" : "Removed from wishlist");
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
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
  }

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-luxury">
        <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-brand-cream-dark">
          {image && (
            <>
              <Image
                src={image.url}
                alt={image.altText}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-opacity duration-500 group-hover:opacity-0"
              />
              <Image
                src={hoverImage.url}
                alt={hoverImage.altText}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            </>
          )}

          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {discount > 0 && <Badge variant="gold">{discount}% Off</Badge>}
            {product.isTrending && <Badge variant="solid">Trending</Badge>}
            {product.isLatest && <Badge variant="outline">New</Badge>}
          </div>

          <button
            onClick={handleWishlist}
            aria-label="Toggle wishlist"
            className={cn(
              "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors hover:bg-white",
              inWishlist && "text-red-500"
            )}
          >
            <Heart size={16} className={inWishlist ? "fill-current" : ""} />
          </button>

          <div className="absolute inset-x-3 bottom-3 flex translate-y-3 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-ink py-2.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-brand-secondary disabled:opacity-50"
            >
              <ShoppingBag size={14} />
              {product.stock === 0 ? "Sold Out" : "Add to Cart"}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickViewOpen(true);
              }}
              aria-label="Quick view"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-brand-ink transition hover:bg-brand-cream-dark"
            >
              <Eye size={16} />
            </button>
          </div>
        </Link>

        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-brand-primary">
            {product.category.name}
          </span>
          <Link href={`/product/${product.slug}`} className="line-clamp-1 font-display text-base font-medium text-brand-ink">
            {product.name}
          </Link>
          <Rating value={product.avgRating} count={product.reviewCount} />
          <div className="mt-1 flex items-center gap-2">
            <span className="font-semibold text-brand-ink">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-sm text-black/40 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      {quickViewOpen && (
        <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />
      )}
    </>
  );
}
