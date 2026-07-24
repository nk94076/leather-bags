import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { CmsPageEditor } from "@/components/admin/cms-page-editor";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EditCmsPage({ params }: Props) {
  const { slug } = await params;
  const page = await prisma.cmsPage.findUnique({ where: { slug } });
  if (!page) notFound();

  return (
    <div>
      <AdminPageHeader title={`Edit: ${page.title}`} description={`/${page.slug}`} />
      <CmsPageEditor
        slug={page.slug}
        title={page.title}
        metaTitle={page.metaTitle ?? ""}
        metaDesc={page.metaDesc ?? ""}
        content={JSON.parse(page.content)}
      />
    </div>
  );
}
