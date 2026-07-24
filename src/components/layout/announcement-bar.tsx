"use client";

import { useEffect, useState } from "react";
import { Truck, RefreshCw, ShieldCheck } from "lucide-react";

const ICONS = [Truck, RefreshCw, ShieldCheck];

const DEFAULT_MESSAGES = [
  "Free Shipping on All Orders Over ₹999",
  "Easy 15-Day Returns & Exchanges",
  "100% Genuine Full-Grain Leather",
];

export function AnnouncementBar({ messages = DEFAULT_MESSAGES }: { messages?: string[] }) {
  const [index, setIndex] = useState(0);
  const list = messages.length > 0 ? messages : DEFAULT_MESSAGES;

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % list.length), 4000);
    return () => clearInterval(id);
  }, [list.length]);

  const Icon = ICONS[index % ICONS.length];

  return (
    <div className="bg-brand-ink text-brand-cream">
      <div className="mx-auto flex h-9 max-w-[1400px] items-center justify-center px-4 text-center">
        <div key={index} className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider animate-fade-in sm:text-xs">
          <Icon size={13} className="text-brand-gold" />
          <span>{list[index]}</span>
        </div>
      </div>
    </div>
  );
}
