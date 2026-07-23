import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "View and manage the products you've saved to your Corium wishlist.",
  robots: { index: false, follow: false },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
