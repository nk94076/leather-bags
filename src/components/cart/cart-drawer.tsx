"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { LinkButton } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lines, updateQuantity, removeItem, subtotal } = useCartStore();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-luxury animate-fade-in">
        <div className="flex items-center justify-between border-b border-black/5 p-5">
          <h2 className="font-display text-lg text-brand-ink">Your Bag ({lines.length})</h2>
          <button onClick={onClose} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <ShoppingBag size={40} className="text-black/20" />
            <p className="text-sm text-black/50">Your bag is empty. Discover our latest arrivals.</p>
            <LinkButton href="/shop" onClick={onClose} size="sm">
              Shop Now
            </LinkButton>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5">
              <ul className="flex flex-col gap-5">
                {lines.map((l) => (
                  <li key={`${l.productId}-${l.variantId ?? "base"}`} className="flex gap-4">
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-cream-dark">
                      {l.image && <Image src={l.image} alt={l.name} fill className="object-cover" />}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/product/${l.slug}`} onClick={onClose} className="line-clamp-2 text-sm font-medium text-brand-ink">
                          {l.name}
                        </Link>
                        <button onClick={() => removeItem(l.productId, l.variantId)} aria-label="Remove item">
                          <Trash2 size={15} className="text-black/40 hover:text-red-500" />
                        </button>
                      </div>
                      {l.color && <span className="text-xs text-black/50">Color: {l.color}</span>}
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-black/10">
                          <button
                            className="px-2.5 py-1 text-sm"
                            onClick={() => updateQuantity(l.productId, l.quantity - 1, l.variantId)}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-xs">{l.quantity}</span>
                          <button
                            className="px-2.5 py-1 text-sm"
                            onClick={() => updateQuantity(l.productId, l.quantity + 1, l.variantId)}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-brand-ink">{formatPrice(l.price * l.quantity)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-black/5 p-5">
              {subtotal() < siteConfig.freeShippingThreshold && (
                <p className="mb-3 text-xs text-brand-secondary">
                  Add {formatPrice(siteConfig.freeShippingThreshold - subtotal())} more for free shipping!
                </p>
              )}
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-black/60">Subtotal</span>
                <span className="font-semibold text-brand-ink">{formatPrice(subtotal())}</span>
              </div>
              <div className="flex flex-col gap-2">
                <LinkButton href="/checkout" onClick={onClose} className="w-full">
                  Checkout
                </LinkButton>
                <LinkButton href="/cart" onClick={onClose} variant="outline" className="w-full">
                  View Bag
                </LinkButton>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
