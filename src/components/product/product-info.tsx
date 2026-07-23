"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Heart, Share2, Truck, ShieldCheck, RefreshCw, Minus, Plus } from "lucide-react";
import { Rating } from "@/components/ui/rating";
import { Button } from "@/components/ui/button";
import { formatPrice, discountPercent, cn } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/lib/site-config";
import type { ProductColor } from "@/types/catalog";

export interface ProductDetail {
  id: string;
  name: string;
  sku: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  avgRating: number;
  reviewCount: number;
  stock: number;
  leatherType: string;
  colors: ProductColor[];
  shortDescription: string;
  image: string;
  categoryName: string;
  categorySlug: string;
}

export function ProductInfo({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const { status } = useSession();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.has(product.id));
  const [color, setColor] = useState(product.colors[0]?.name);
  const [qty, setQty] = useState(1);
  const discount = discountPercent(product.price, product.compareAtPrice);

  function handleAddToCart() {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      color,
      quantity: qty,
      stock: product.stock,
    });
    toast.success(`${product.name} added to cart`);
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push("/checkout");
  }

  async function handleWishlist() {
    const result = await toggleWishlist(product.id);
    if (result === "auth-required") {
      toast.error("Please sign in to save items to your wishlist");
      return;
    }
    toast.success(result === "added" ? "Added to wishlist" : "Removed from wishlist");
  }

  async function handleShare() {
    const url = `${siteConfig.url}/product/${product.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Product link copied to clipboard");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Link href={`/shop/${product.categorySlug}`} className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
          {product.categoryName}
        </Link>
        <span className="text-xs text-black/40">SKU: {product.sku}</span>
      </div>

      <h1 className="font-display text-3xl text-brand-ink sm:text-4xl">{product.name}</h1>

      <div className="flex items-center gap-3">
        <Rating value={product.avgRating} count={product.reviewCount} />
        {status !== "unauthenticated" && (
          <a href="#reviews" className="text-xs text-black/40 hover:underline">
            View reviews
          </a>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-2xl font-semibold text-brand-ink">{formatPrice(product.price)}</span>
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <>
            <span className="text-lg text-black/40 line-through">{formatPrice(product.compareAtPrice)}</span>
            <span className="rounded-full bg-brand-gold/15 px-3 py-1 text-xs font-semibold text-brand-gold">
              Save {discount}%
            </span>
          </>
        )}
      </div>

      <p className="text-sm leading-relaxed text-black/60">{product.shortDescription}</p>
      <p className="text-xs text-black/50">Genuine {product.leatherType}</p>

      {product.colors.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-ink">
            Colour: <span className="font-normal text-black/50">{color}</span>
          </p>
          <div className="flex gap-2.5">
            {product.colors.map((c) => (
              <button
                key={c.name}
                title={c.name}
                onClick={() => setColor(c.name)}
                className={cn(
                  "h-9 w-9 rounded-full border-2 transition",
                  color === c.name ? "border-brand-primary scale-110" : "border-transparent"
                )}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-ink">Quantity</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-full border border-black/10">
            <button className="px-4 py-2.5" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-sm">{qty}</span>
            <button
              className="px-4 py-2.5"
              onClick={() => setQty((q) => Math.min(product.stock || 10, q + 1))}
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
          <span className={cn("text-xs font-medium", product.stock > 0 ? "text-green-700" : "text-red-600")}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <Button onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1">
          Add to Cart
        </Button>
        <Button onClick={handleBuyNow} disabled={product.stock === 0} variant="secondary" className="flex-1">
          Buy Now
        </Button>
        <button
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center self-center rounded-full border border-black/10 transition hover:bg-brand-cream sm:self-auto",
            inWishlist && "border-red-200 bg-red-50 text-red-500"
          )}
        >
          <Heart size={18} className={inWishlist ? "fill-current" : ""} />
        </button>
        <button
          onClick={handleShare}
          aria-label="Share product"
          className="flex h-12 w-12 shrink-0 items-center justify-center self-center rounded-full border border-black/10 transition hover:bg-brand-cream sm:self-auto"
        >
          <Share2 size={18} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 rounded-2xl bg-brand-cream p-5 sm:grid-cols-3">
        <div className="flex items-center gap-2 text-xs text-black/60">
          <Truck size={16} className="text-brand-primary" /> Free shipping over {formatPrice(siteConfig.freeShippingThreshold)}
        </div>
        <div className="flex items-center gap-2 text-xs text-black/60">
          <RefreshCw size={16} className="text-brand-primary" /> 15-day easy returns
        </div>
        <div className="flex items-center gap-2 text-xs text-black/60">
          <ShieldCheck size={16} className="text-brand-primary" /> 2-year warranty
        </div>
      </div>
    </div>
  );
}
