import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { CategoryForm } from "@/components/admin/category-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div>
      <AdminPageHeader title={`Edit: ${category.name}`} />
      <CategoryForm
        initial={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          imageUrl: category.imageUrl,
          bannerUrl: category.bannerUrl ?? "",
          icon: category.icon ?? "",
          metaTitle: category.metaTitle ?? "",
          metaDesc: category.metaDesc ?? "",
          sortOrder: category.sortOrder,
          isFeatured: category.isFeatured,
        }}
      />
    </div>
  );
}
