import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader, AdminTable, AdminTh, AdminTd } from "@/components/admin/admin-ui";
import { LinkButton } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const perPage = 20;

  const where = q ? { OR: [{ name: { contains: q } }, { sku: { contains: q } }] } : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, images: { take: 1, orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description={`${total} products in catalog`}
        action={
          <LinkButton href="/admin/products/new" size="sm">
            <Plus size={14} /> Add Product
          </LinkButton>
        }
      />

      <form className="mb-5 flex max-w-sm items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5">
        <Search size={16} className="text-black/40" />
        <input name="q" defaultValue={q} placeholder="Search by name or SKU..." className="w-full text-sm outline-none" />
      </form>

      <AdminTable>
        <thead>
          <tr>
            <AdminTh>Product</AdminTh>
            <AdminTh>Category</AdminTh>
            <AdminTh>Price</AdminTh>
            <AdminTh>Stock</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh className="text-right">Actions</AdminTh>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-brand-cream/40">
              <AdminTd>
                <div className="flex items-center gap-3">
                  <div className="relative h-11 w-10 shrink-0 overflow-hidden rounded-lg bg-brand-cream-dark">
                    {p.images[0] && <Image src={p.images[0].url} alt={p.name} fill sizes="44px" className="object-cover" />}
                  </div>
                  <div>
                    <p className="line-clamp-1 max-w-[220px] font-medium text-brand-ink">{p.name}</p>
                    <p className="text-xs text-black/40">{p.sku}</p>
                  </div>
                </div>
              </AdminTd>
              <AdminTd className="text-black/60">{p.category.name}</AdminTd>
              <AdminTd className="text-black/60">{formatPrice(p.price)}</AdminTd>
              <AdminTd>
                <span className={p.stock === 0 ? "text-red-600" : "text-black/60"}>{p.stock}</span>
              </AdminTd>
              <AdminTd>
                <div className="flex flex-wrap gap-1">
                  {p.isActive ? <Badge variant="outline">Active</Badge> : <Badge variant="outline">Hidden</Badge>}
                  {p.isFeatured && <Badge variant="gold">Featured</Badge>}
                  {p.isTrending && <Badge variant="solid">Trending</Badge>}
                </div>
              </AdminTd>
              <AdminTd>
                <div className="flex items-center justify-end gap-3">
                  <Link href={`/admin/products/${p.id}`} className="text-black/40 hover:text-brand-primary" aria-label="Edit">
                    <Pencil size={15} />
                  </Link>
                  <DeleteButton endpoint={`/api/admin/products/${p.id}`} confirmMessage="Delete this product?" />
                </div>
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/products?${q ? `q=${q}&` : ""}page=${p}`}
              className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm ${
                p === page ? "border-brand-primary bg-brand-primary text-white" : "border-black/10"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
