import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader, AdminTable, AdminTh, AdminTd } from "@/components/admin/admin-ui";
import { LinkButton } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description={`${categories.length} categories`}
        action={
          <LinkButton href="/admin/categories/new" size="sm">
            <Plus size={14} /> Add Category
          </LinkButton>
        }
      />

      <AdminTable>
        <thead>
          <tr>
            <AdminTh>Category</AdminTh>
            <AdminTh>Slug</AdminTh>
            <AdminTh>Products</AdminTh>
            <AdminTh>Order</AdminTh>
            <AdminTh className="text-right">Actions</AdminTh>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id} className="hover:bg-brand-cream/40">
              <AdminTd>
                <div className="flex items-center gap-3">
                  <div className="relative h-11 w-10 shrink-0 overflow-hidden rounded-lg bg-brand-cream-dark">
                    <Image src={c.imageUrl} alt={c.name} fill sizes="44px" className="object-cover" />
                  </div>
                  <span className="font-medium text-brand-ink">{c.name}</span>
                </div>
              </AdminTd>
              <AdminTd className="text-black/50">/{c.slug}</AdminTd>
              <AdminTd className="text-black/60">{c._count.products}</AdminTd>
              <AdminTd className="text-black/60">{c.sortOrder}</AdminTd>
              <AdminTd>
                <div className="flex items-center justify-end gap-3">
                  <Link href={`/admin/categories/${c.id}`} className="text-black/40 hover:text-brand-primary">
                    <Pencil size={15} />
                  </Link>
                  <DeleteButton endpoint={`/api/admin/categories/${c.id}`} confirmMessage="Delete this category?" />
                </div>
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  );
}
