"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FaqItemData {
  id: string;
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItemData[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id} className="overflow-hidden rounded-2xl border border-black/5 bg-white">
            <button
              onClick={() => setOpenId(open ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-sm font-medium text-brand-ink">{item.question}</span>
              <ChevronDown size={16} className={cn("shrink-0 text-black/40 transition-transform", open && "rotate-180")} />
            </button>
            <div className={cn("grid transition-all duration-300", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm leading-relaxed text-black/60">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
