"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Minus, Plus, Trash2, ShoppingBag, Tag, X } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button, LinkButton } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

export default function CartPage() {
  const { status } = useSession();
  const router = useRouter();
  const { lines, updateQuantity, removeItem, subtotal, couponCode, applyCoupon, clearCoupon } = useCartStore();
  const [couponInput, setCouponInput] = useState(couponCode ?? "");
  const [couponInfo, setCouponInfo] = useState<{ discount: number; description: string } | null>(null);
  const [applying, setApplying] = useState(false);

  const sub = subtotal();
  const discount = couponInfo?.discount ?? 0;
  const shippingFee = sub - discount >= siteConfig.freeShippingThreshold || sub === 0 ? 0 : 149;
  const estimatedTax = Math.round((sub - discount) * 0.05);
  const total = sub - discount + shippingFee + estimatedTax;

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setApplying(true);
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput.trim(), subtotal: sub }),
    });
    const data = await res.json();
    setApplying(false);
    if (!res.ok) {
      toast.error(data.error ?? "Invalid coupon");
      return;
    }
    applyCoupon(data.code);
    setCouponInfo({ discount: data.discount, description: data.description });
    toast.success(`Coupon "${data.code}" applied!`);
  }

  function handleRemoveCoupon() {
    clearCoupon();
    setCouponInfo(null);
    setCouponInput("");
  }

  function handleCheckout() {
    if (status !== "authenticated") {
      router.push("/login?callbackUrl=/checkout");
      return;
    }
    router.push("/checkout");
  }

  return (
    <div className="py-10 sm:py-14">
      <Container>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shopping Bag" }]} />
        <h1 className="mb-10 mt-4 font-display text-3xl text-brand-ink sm:text-4xl">Your Shopping Bag</h1>

        {lines.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <ShoppingBag size={48} className="text-black/20" />
            <p className="font-display text-xl text-brand-ink">Your bag is empty</p>
            <p className="text-sm text-black/50">Looks like you haven&apos;t added anything yet.</p>
            <LinkButton href="/shop" className="mt-2">
              Continue Shopping
            </LinkButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            <div className="flex flex-col gap-4 lg:col-span-2">
              {lines.map((l) => (
                <div key={`${l.productId}-${l.variantId ?? "base"}`} className="flex gap-4 rounded-2xl border border-black/5 bg-white p-4 sm:gap-6 sm:p-5">
                  <Link href={`/product/${l.slug}`} className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-brand-cream-dark sm:h-32 sm:w-28">
                    {l.image && <Image src={l.image} alt={l.name} fill sizes="150px" className="object-cover" />}
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/product/${l.slug}`} className="font-display text-base text-brand-ink hover:text-brand-primary sm:text-lg">
                        {l.name}
                      </Link>
                      <button onClick={() => removeItem(l.productId, l.variantId)} aria-label="Remove item">
                        <Trash2 size={16} className="text-black/40 hover:text-red-500" />
                      </button>
                    </div>
                    {l.color && <span className="text-xs text-black/50">Colour: {l.color}</span>}
                    <span className="mt-1 text-sm font-semibold text-brand-ink">{formatPrice(l.price)}</span>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center rounded-full border border-black/10">
                        <button className="px-3 py-2" onClick={() => updateQuantity(l.productId, l.quantity - 1, l.variantId)} aria-label="Decrease quantity">
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center text-sm">{l.quantity}</span>
                        <button className="px-3 py-2" onClick={() => updateQuantity(l.productId, l.quantity + 1, l.variantId)} aria-label="Increase quantity">
                          <Plus size={13} />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-brand-ink">{formatPrice(l.price * l.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
              <LinkButton href="/shop" variant="ghost" size="sm" className="self-start">
                ← Continue Shopping
              </LinkButton>
            </div>

            <div className="h-fit rounded-2xl border border-black/5 bg-white p-6">
              <h2 className="font-display text-lg text-brand-ink">Order Summary</h2>

              <div className="mt-5">
                {couponCode ? (
                  <div className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <Tag size={14} /> {couponCode} applied
                    </div>
                    <button onClick={handleRemoveCoupon} aria-label="Remove coupon">
                      <X size={14} className="text-green-700" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Coupon code"
                      className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-brand-primary"
                    />
                    <Button size="sm" variant="outline" onClick={handleApplyCoupon} disabled={applying}>
                      Apply
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-2.5 border-t border-black/5 pt-5 text-sm">
                <div className="flex justify-between text-black/60">
                  <span>Subtotal</span>
                  <span>{formatPrice(sub)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Discount</span>
                    <span>−{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-black/60">
                  <span>Estimated Shipping</span>
                  <span>{shippingFee === 0 ? "Free" : formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-black/60">
                  <span>Estimated Tax (GST 5%)</span>
                  <span>{formatPrice(estimatedTax)}</span>
                </div>
              </div>

              <div className="mt-4 flex justify-between border-t border-black/10 pt-4 text-base font-semibold text-brand-ink">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {sub < siteConfig.freeShippingThreshold && (
                <p className="mt-3 text-xs text-brand-secondary">
                  Add {formatPrice(siteConfig.freeShippingThreshold - sub)} more to qualify for free shipping.
                </p>
              )}

              <Button onClick={handleCheckout} className="mt-6 w-full">
                Proceed to Checkout
              </Button>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] text-black/40">
                {["Visa", "Mastercard", "UPI", "COD"].map((p) => (
                  <span key={p} className="rounded border border-black/10 px-2 py-1">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
