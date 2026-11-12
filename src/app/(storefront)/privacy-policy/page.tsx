import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCmsPage } from "@/lib/data/cms";
import { LegalPage } from "@/components/legal/legal-page";
import { siteConfig } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage("privacy-policy");
  return {
    title: page?.metaTitle ?? "Privacy Policy",
    description: page?.metaDesc ?? "Read the Corium Leather Co. privacy policy.",
    alternates: { canonical: `${siteConfig.url}/privacy-policy` },
  };
}

export default async function PrivacyPolicyPage() {
  const page = await getCmsPage("privacy-policy");
  if (!page) notFound();

  return <LegalPage title={page.title} updatedAt={page.content.updatedAt} sections={page.content.sections} />;
}
