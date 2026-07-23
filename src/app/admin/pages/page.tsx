import Link from "next/link";
import { FileText, HelpCircle, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader, AdminCard } from "@/components/admin/admin-ui";

export default async function AdminPagesListPage() {
  const [pages, faqCount] = await Promise.all([
    prisma.cmsPage.findMany({ orderBy: { title: "asc" } }),
    prisma.faqItem.count(),
  ]);

  return (
    <div>
      <AdminPageHeader title="Pages CMS" description="Edit the content of every static page — no code required" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((p) => (
          <Link key={p.slug} href={`/admin/pages/${p.slug}`}>
            <AdminCard className="flex items-center justify-between transition hover:shadow-luxury">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-cream text-brand-primary">
                  <FileText size={18} />
                </span>
                <div>
                  <p className="font-medium text-brand-ink">{p.title}</p>
                  <p className="text-xs text-black/40">/{p.slug}</p>
                </div>
              </div>
              <Pencil size={15} className="text-black/30" />
            </AdminCard>
          </Link>
        ))}

        <Link href="/admin/pages/faq">
          <AdminCard className="flex items-center justify-between transition hover:shadow-luxury">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-cream text-brand-primary">
                <HelpCircle size={18} />
              </span>
              <div>
                <p className="font-medium text-brand-ink">FAQs</p>
                <p className="text-xs text-black/40">{faqCount} questions</p>
              </div>
            </div>
            <Pencil size={15} className="text-black/30" />
          </AdminCard>
        </Link>
      </div>
    </div>
  );
}
