import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCmsPage } from "@/lib/data/cms";
import { LegalPage } from "@/components/legal/legal-page";
import { siteConfig } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage("shipping-return-policy");
  return {
    title: page?.metaTitle ?? "Shipping & Return Policy",
    description: page?.metaDesc ?? "Read the Corium Leather Co. shipping and return policy.",
    alternates: { canonical: `${siteConfig.url}/shipping-return-policy` },
  };
}

export default async function ShippingReturnPolicyPage() {
  const page = await getCmsPage("shipping-return-policy");
  if (!page) notFound();

  return <LegalPage title={page.title} updatedAt={page.content.updatedAt} sections={page.content.sections} />;
}
