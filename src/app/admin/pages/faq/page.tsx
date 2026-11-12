import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { FaqManager } from "@/components/admin/faq-manager";

export default async function AdminFaqPage() {
  const faqs = await prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <AdminPageHeader title="FAQs" description="Manage frequently asked questions shown on the FAQ page" />
      <FaqManager faqs={faqs} />
    </div>
  );
}
