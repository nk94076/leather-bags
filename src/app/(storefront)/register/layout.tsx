import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an Account",
  description: "Create a Corium account to track orders, save your wishlist and enjoy a faster checkout.",
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
