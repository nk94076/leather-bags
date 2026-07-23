"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RecentlyViewedState {
  ids: string[];
  add: (id: string) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      ids: [],
      add: (id) =>
        set({
          ids: [id, ...get().ids.filter((existing) => existing !== id)].slice(0, 12),
        }),
    }),
    { name: "corium-recently-viewed" }
  )
);
