import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Track the status of your Corium order using your order number and email address.",
};

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
