import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCmsPage } from "@/lib/data/cms";
import { LegalPage } from "@/components/legal/legal-page";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage("terms-and-conditions");
  return {
    title: page?.metaTitle ?? "Terms & Conditions",
    description: page?.metaDesc ?? "Read the Corium Leather Co. terms and conditions.",
  };
}

export default async function TermsPage() {
  const page = await getCmsPage("terms-and-conditions");
  if (!page) notFound();

  return <LegalPage title={page.title} updatedAt={page.content.updatedAt} sections={page.content.sections} />;
}
