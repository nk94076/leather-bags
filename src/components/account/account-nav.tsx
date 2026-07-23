"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Package, MapPin, Lock, Heart, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/orders", label: "My Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/password", label: "Change Password", icon: Lock },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 rounded-2xl border border-black/5 bg-white p-3">
      {LINKS.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
              active ? "bg-brand-primary text-white" : "text-brand-ink hover:bg-brand-cream"
            )}
          >
            <l.icon size={16} /> {l.label}
          </Link>
        );
      })}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
      >
        <LogOut size={16} /> Sign Out
      </button>
    </nav>
  );
}
