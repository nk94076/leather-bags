"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown, LogOut, Package, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { useUIStore } from "@/lib/store/ui-store";
import { siteConfig } from "@/lib/site-config";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SearchBar } from "@/components/layout/search-bar";
import { useMounted } from "@/lib/use-mounted";

export interface HeaderCategory {
  name: string;
  slug: string;
  imageUrl: string;
}

export function Header({ categories }: { categories: HeaderCategory[] }) {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { mobileMenuOpen, setMobileMenuOpen, searchOpen, setSearchOpen, cartOpen, setCartOpen } = useUIStore();
  const mounted = useMounted();
  const itemCount = useCartStore((s) => s.itemCount());
  const wishlistCount = useWishlistStore((s) => s.ids.size);
  const hydrateWishlist = useWishlistStore((s) => s.hydrate);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (status === "authenticated") hydrateWishlist();
  }, [status, hydrateWishlist]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          scrolled ? "glass shadow-sm" : "bg-brand-cream"
        )}
      >
        <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <button
            className="flex items-center lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} className="text-brand-ink" />
          </button>

          <Link href="/" className="font-display text-2xl font-semibold tracking-[0.15em] text-brand-ink sm:text-3xl">
            {siteConfig.name}
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            <Link href="/" className="link-underline text-sm font-medium text-brand-ink">
              Home
            </Link>
            <div
              className="relative"
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <Link href="/shop" className="link-underline flex items-center gap-1 text-sm font-medium text-brand-ink">
                Shop <ChevronDown size={14} />
              </Link>
              {megaOpen && (
                <div className="absolute left-1/2 top-full z-50 w-[720px] -translate-x-1/2 pt-4">
                  <div className="grid grid-cols-5 gap-4 rounded-2xl border border-black/5 bg-white p-6 shadow-luxury animate-fade-in">
                    {categories.slice(0, 10).map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/shop/${cat.slug}`}
                        className="group flex flex-col items-center gap-2 text-center"
                      >
                        <span
                          className="block h-16 w-16 rounded-full bg-cover bg-center ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-105"
                          style={{ backgroundImage: `url(${cat.imageUrl})` }}
                        />
                        <span className="text-xs font-medium text-brand-ink group-hover:text-brand-primary">
                          {cat.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link href="/about-us" className="link-underline text-sm font-medium text-brand-ink">
              About Us
            </Link>
            <Link href="/contact-us" className="link-underline text-sm font-medium text-brand-ink">
              Contact
            </Link>
            <Link href="/faq" className="link-underline text-sm font-medium text-brand-ink">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-brand-ink hover:bg-brand-cream-dark"
            >
              <Search size={19} />
            </button>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative hidden h-10 w-10 items-center justify-center rounded-full text-brand-ink hover:bg-brand-cream-dark sm:flex"
            >
              <Heart size={19} />
              {mounted && wishlistCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary text-[10px] text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button
              aria-label="Cart"
              onClick={() => setCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-brand-ink hover:bg-brand-cream-dark"
            >
              <ShoppingBag size={19} />
              {mounted && itemCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary text-[10px] text-white">
                  {itemCount}
                </span>
              )}
            </button>

            <div
              className="relative hidden sm:block"
              onMouseEnter={() => setAccountOpen(true)}
              onMouseLeave={() => setAccountOpen(false)}
            >
              <Link
                href={session ? "/account" : "/login"}
                aria-label="Account"
                className="flex h-10 w-10 items-center justify-center rounded-full text-brand-ink hover:bg-brand-cream-dark"
              >
                <User size={19} />
              </Link>
              {session && accountOpen && (
                <div className="absolute right-0 top-full w-52 pt-2">
                  <div className="rounded-xl border border-black/5 bg-white p-2 shadow-luxury animate-fade-in">
                    <p className="truncate px-3 py-2 text-xs text-black/50">Signed in as {session.user?.name}</p>
                    <Link href="/account" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-brand-cream">
                      <User size={14} /> My Account
                    </Link>
                    <Link href="/account/orders" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-brand-cream">
                      <Package size={14} /> Orders
                    </Link>
                    <Link href="/account/addresses" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-brand-cream">
                      <MapPin size={14} /> Addresses
                    </Link>
                    {session.user?.role === "ADMIN" && (
                      <Link href="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-brand-cream">
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {searchOpen && <SearchBar onClose={() => setSearchOpen(false)} />}
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[82%] max-w-sm overflow-y-auto bg-brand-cream p-6 shadow-luxury animate-fade-in">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-xl text-brand-ink">{siteConfig.name}</span>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                <X size={22} />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {[
                { href: "/", label: "Home" },
                { href: "/shop", label: "Shop All" },
                { href: "/about-us", label: "About Us" },
                { href: "/contact-us", label: "Contact" },
                { href: "/faq", label: "FAQ" },
                { href: "/track-order", label: "Track Order" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-2 py-3 text-base font-medium text-brand-ink hover:bg-brand-cream-dark"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <p className="mb-2 mt-6 px-2 text-xs font-semibold uppercase tracking-wider text-black/40">Categories</p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/shop/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-brand-ink hover:bg-brand-cream-dark"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-2 border-t border-black/10 pt-6">
              {session ? (
                <>
                  <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-2 py-3 text-sm font-medium">
                    My Account
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="rounded-lg px-2 py-3 text-left text-sm font-medium text-red-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-2 py-3 text-sm font-medium">
                    Login
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-2 py-3 text-sm font-medium">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
