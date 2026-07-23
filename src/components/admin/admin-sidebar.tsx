"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Star,
  Ticket,
  Home,
  FileText,
  Image as ImageIcon,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/homepage", label: "Homepage Manager", icon: Home },
  { href: "/admin/pages", label: "Pages CMS", icon: FileText },
  { href: "/admin/media", label: "Media Manager", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-white/10 bg-brand-ink text-brand-cream">
      <div className="flex h-20 items-center px-6">
        <Link href="/admin" className="font-display text-xl tracking-[0.15em] text-white">
          {siteConfig.name}
          <span className="ml-2 rounded-full bg-brand-gold px-2 py-0.5 text-[10px] font-sans uppercase tracking-wide text-white">
            Admin
          </span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {LINKS.map((l) => {
          const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition",
                active ? "bg-brand-primary text-white" : "text-brand-cream/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <l.icon size={16} /> {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex flex-col gap-1 border-t border-white/10 p-3">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-brand-cream/70 hover:bg-white/5 hover:text-white">
          <ExternalLink size={16} /> View Store
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm text-red-300 hover:bg-red-500/10"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
