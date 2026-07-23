"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Truck, CreditCard, Smartphone, Landmark, Wallet, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { AddressForm } from "@/components/checkout/address-form";
import { useCartStore } from "@/lib/store/cart-store";
import { cn, formatPrice } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

const PAYMENT_METHODS = [
  { value: "COD", label: "Cash on Delivery", icon: Truck, note: "₹49 handling fee applies" },
  { value: "UPI", label: "UPI", icon: Smartphone, note: "GPay, PhonePe, Paytm & more" },
  { value: "CARD", label: "Credit / Debit Card", icon: CreditCard, note: "Visa, Mastercard, RuPay, Amex" },
  { value: "NETBANKING", label: "Net Banking", icon: Landmark, note: "All major Indian banks" },
  { value: "WALLET", label: "Wallet", icon: Wallet, note: "Paytm, Amazon Pay & more" },
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, couponCode, clearCart } = useCartStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_METHODS)[number]["value"]>("COD");
  const [discount, setDiscount] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  useEffect(() => {
    fetch("/api/addresses")
      .then((res) => res.json())
      .then((data: Address[]) => {
        setAddresses(data);
        const def = data.find((a) => a.isDefault) ?? data[0];
        if (def) setSelectedAddress(def.id);
        setLoadingAddresses(false);
        if (data.length === 0) setShowAddressForm(true);
      })
      .catch(() => setLoadingAddresses(false));
  }, []);

  useEffect(() => {
    if (!couponCode) return;
    fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, subtotal: subtotal() }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setDiscount(data?.discount ?? 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [couponCode]);

  const sub = subtotal();
  const codFee = paymentMethod === "COD" ? 49 : 0;
  const shippingFee = sub - discount >= siteConfig.freeShippingThreshold ? 0 : 149;
  const tax = Math.round(((sub - discount) * 5) / 100);
  const total = sub - discount + shippingFee + tax + codFee;

  async function placeOrder() {
    if (!selectedAddress) {
      toast.error("Please select or add a shipping address");
      return;
    }
    if (lines.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setPlacing(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        addressId: selectedAddress,
        paymentMethod,
        couponCode: couponCode ?? undefined,
        items: lines.map((l) => ({
          productId: l.productId,
          variantId: l.variantId,
          quantity: l.quantity,
          color: l.color,
        })),
      }),
    });
    const data = await res.json();
    setPlacing(false);
    if (!res.ok) {
      toast.error(data.error ?? "Something went wrong placing your order");
      return;
    }
    clearCart();
    toast.success("Order placed successfully!");
    router.push(`/checkout/confirmation/${data.id}`);
  }

  if (lines.length === 0) {
    return (
      <Container className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="font-display text-xl text-brand-ink">Your bag is empty</p>
        <Button onClick={() => router.push("/shop")}>Shop Now</Button>
      </Container>
    );
  }

  return (
    <div className="py-10 sm:py-14">
      <Container>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Bag", href: "/cart" }, { label: "Checkout" }]} />
        <h1 className="mb-10 mt-4 font-display text-3xl text-brand-ink sm:text-4xl">Checkout</h1>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="flex flex-col gap-8 lg:col-span-2">
            <section>
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg text-brand-ink">
                <MapPin size={18} /> Shipping Address
              </h2>
              {!loadingAddresses && addresses.length > 0 && (
                <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {addresses.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setSelectedAddress(a.id)}
                      className={cn(
                        "rounded-2xl border p-4 text-left text-sm transition",
                        selectedAddress === a.id ? "border-brand-primary bg-brand-cream" : "border-black/10 hover:border-black/20"
                      )}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-semibold text-brand-ink">{a.label}</span>
                        {a.isDefault && <span className="text-[10px] uppercase text-brand-primary">Default</span>}
                      </div>
                      <p className="text-black/60">{a.fullName}</p>
                      <p className="text-black/50">
                        {a.line1}, {a.line2 ? `${a.line2}, ` : ""}
                        {a.city}, {a.state} {a.postalCode}
                      </p>
                      <p className="mt-1 text-black/50">{a.phone}</p>
                    </button>
                  ))}
                </div>
              )}

              {showAddressForm ? (
                <div className="rounded-2xl border border-black/10 p-5">
                  <AddressForm
                    onSaved={(addr) => {
                      setAddresses((prev) => [addr as unknown as Address, ...prev]);
                      setSelectedAddress(addr.id);
                      setShowAddressForm(false);
                    }}
                    onCancel={addresses.length > 0 ? () => setShowAddressForm(false) : undefined}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="flex items-center gap-2 text-sm font-medium text-brand-primary hover:underline"
                >
                  <Plus size={15} /> Add a new address
                </button>
              )}
            </section>

            <section>
              <h2 className="mb-4 font-display text-lg text-brand-ink">Payment Method</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setPaymentMethod(m.value)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border p-4 text-left transition",
                      paymentMethod === m.value ? "border-brand-primary bg-brand-cream" : "border-black/10 hover:border-black/20"
                    )}
                  >
                    <m.icon size={20} className="text-brand-primary" />
                    <div>
                      <p className="text-sm font-medium text-brand-ink">{m.label}</p>
                      <p className="text-xs text-black/50">{m.note}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="h-fit rounded-2xl border border-black/5 bg-white p-6">
            <h2 className="mb-5 font-display text-lg text-brand-ink">Order Summary</h2>
            <div className="flex max-h-64 flex-col gap-4 overflow-y-auto pr-1">
              {lines.map((l) => (
                <div key={`${l.productId}-${l.variantId ?? "base"}`} className="flex gap-3">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-brand-cream-dark">
                    {l.image && <Image src={l.image} alt={l.name} fill sizes="80px" className="object-cover" />}
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-ink text-[10px] text-white">
                      {l.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="line-clamp-1 text-sm text-brand-ink">{l.name}</p>
                    {l.color && <p className="text-xs text-black/40">{l.color}</p>}
                  </div>
                  <span className="text-sm font-medium text-brand-ink">{formatPrice(l.price * l.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-2.5 border-t border-black/5 pt-5 text-sm">
              <div className="flex justify-between text-black/60">
                <span>Subtotal</span>
                <span>{formatPrice(sub)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount ({couponCode})</span>
                  <span>−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-black/60">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? "Free" : formatPrice(shippingFee)}</span>
              </div>
              <div className="flex justify-between text-black/60">
                <span>Tax (GST 5%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              {codFee > 0 && (
                <div className="flex justify-between text-black/60">
                  <span>COD Handling Fee</span>
                  <span>{formatPrice(codFee)}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-between border-t border-black/10 pt-4 text-base font-semibold text-brand-ink">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <Button onClick={placeOrder} disabled={placing} className="mt-6 w-full">
              {placing ? "Placing Order..." : "Place Order"}
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
