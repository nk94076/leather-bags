"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export function AdminShell({ children, userName }: { children: React.ReactNode; userName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-brand-cream">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <AdminSidebar />
          </div>
          <button onClick={() => setOpen(false)} className="absolute right-4 top-4 z-10 text-white">
            <X size={22} />
          </button>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <div className="flex h-16 items-center justify-between border-b border-black/5 bg-white px-4 lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <span className="font-display text-lg text-brand-ink">Admin</span>
          <span className="text-xs text-black/50">{userName}</span>
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
