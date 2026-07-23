import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Track the status of your Corium order using your order number and email address.",
  alternates: { canonical: `${siteConfig.url}/track-order` },
};

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
