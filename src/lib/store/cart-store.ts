"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  color?: string;
  variantId?: string;
  quantity: number;
  stock: number;
}

interface CartState {
  lines: CartLine[];
  couponCode: string | null;
  addItem: (line: CartLine) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  applyCoupon: (code: string) => void;
  clearCoupon: () => void;
  clearCart: () => void;
  subtotal: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      couponCode: null,
      addItem: (line) =>
        set((state) => {
          const existing = state.lines.find(
            (l) => l.productId === line.productId && l.variantId === line.variantId
          );
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l === existing
                  ? { ...l, quantity: Math.min(l.quantity + line.quantity, l.stock || 99) }
                  : l
              ),
            };
          }
          return { lines: [...state.lines, line] };
        }),
      removeItem: (productId, variantId) =>
        set((state) => ({
          lines: state.lines.filter(
            (l) => !(l.productId === productId && l.variantId === variantId)
          ),
        })),
      updateQuantity: (productId, quantity, variantId) =>
        set((state) => ({
          lines: state.lines
            .map((l) =>
              l.productId === productId && l.variantId === variantId
                ? { ...l, quantity: Math.max(1, quantity) }
                : l
            )
            .filter((l) => l.quantity > 0),
        })),
      applyCoupon: (code) => set({ couponCode: code }),
      clearCoupon: () => set({ couponCode: null }),
      clearCart: () => set({ lines: [], couponCode: null }),
      subtotal: () => get().lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
      itemCount: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
    }),
    { name: "corium-cart" }
  )
);
