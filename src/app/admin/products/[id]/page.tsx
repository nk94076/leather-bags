import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ProductForm } from "@/components/admin/product-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } } } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <AdminPageHeader title={`Edit: ${product.name}`} description={`SKU: ${product.sku}`} />
      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          categoryId: product.categoryId,
          leatherType: product.leatherType,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          stock: product.stock,
          colors: JSON.parse(product.colors),
          shortDescription: product.shortDescription,
          description: product.description,
          dimensions: product.dimensions ?? "",
          weight: product.weight ?? "",
          warranty: product.warranty ?? "",
          careInstructions: product.careInstructions ?? "",
          isFeatured: product.isFeatured,
          isTrending: product.isTrending,
          isLatest: product.isLatest,
          isActive: product.isActive,
          metaTitle: product.metaTitle ?? "",
          metaDesc: product.metaDesc ?? "",
          images: product.images.map((i) => ({ url: i.url, altText: i.altText })),
        }}
      />
    </div>
  );
}
