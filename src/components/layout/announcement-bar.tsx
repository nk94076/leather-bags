"use client";

import { useEffect, useState } from "react";
import { Truck, RefreshCw, ShieldCheck } from "lucide-react";

const DEFAULT_MESSAGES = [
  { icon: Truck, text: "Free Shipping on All Orders Over ₹999" },
  { icon: RefreshCw, text: "Easy 15-Day Returns & Exchanges" },
  { icon: ShieldCheck, text: "100% Genuine Full-Grain Leather" },
];

export function AnnouncementBar({ messages = DEFAULT_MESSAGES }: { messages?: typeof DEFAULT_MESSAGES }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % messages.length), 4000);
    return () => clearInterval(id);
  }, [messages.length]);

  const Current = messages[index];

  return (
    <div className="bg-brand-ink text-brand-cream">
      <div className="mx-auto flex h-9 max-w-[1400px] items-center justify-center px-4 text-center">
        <div key={index} className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider animate-fade-in sm:text-xs">
          <Current.icon size={13} className="text-brand-gold" />
          <span>{Current.text}</span>
        </div>
      </div>
    </div>
  );
}
