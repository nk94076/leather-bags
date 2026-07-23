import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <div>
      <AdminPageHeader title="Add Product" description="Create a new product listing" />
      <ProductForm categories={categories} />
    </div>
  );
}
