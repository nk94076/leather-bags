"use client";

import { create } from "zustand";

interface WishlistState {
  ids: Set<string>;
  loaded: boolean;
  hydrate: () => Promise<void>;
  toggle: (productId: string) => Promise<"added" | "removed" | "auth-required">;
  has: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  ids: new Set(),
  loaded: false,
  hydrate: async () => {
    try {
      const res = await fetch("/api/wishlist");
      if (!res.ok) {
        set({ loaded: true });
        return;
      }
      const data: { productId: string }[] = await res.json();
      set({ ids: new Set(data.map((d) => d.productId)), loaded: true });
    } catch {
      set({ loaded: true });
    }
  },
  has: (productId) => get().ids.has(productId),
  toggle: async (productId) => {
    const current = get().ids;
    const alreadyIn = current.has(productId);
    const res = await fetch("/api/wishlist", {
      method: alreadyIn ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    if (res.status === 401) return "auth-required";
    if (!res.ok) return alreadyIn ? "added" : "removed";
    set((state) => {
      const next = new Set(state.ids);
      if (alreadyIn) next.delete(productId);
      else next.add(productId);
      return { ids: next };
    });
    return alreadyIn ? "removed" : "added";
  },
}));
