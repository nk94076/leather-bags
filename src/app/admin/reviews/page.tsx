import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader, AdminTable, AdminTh, AdminTd } from "@/components/admin/admin-ui";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { ReviewRowActions } from "@/components/admin/review-row-actions";
import { formatDate } from "@/lib/utils";

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminReviewsPage({ searchParams }: Props) {
  const { status } = await searchParams;

  const reviews = await prisma.review.findMany({
    where: status ? { status: status as never } : undefined,
    include: { product: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const statusStyle: Record<string, "outline" | "gold" | "solid"> = {
    PENDING: "gold",
    APPROVED: "outline",
    REJECTED: "solid",
  };

  return (
    <div>
      <AdminPageHeader title="Reviews" description={`${reviews.length} reviews`} />

      <div className="mb-5 flex flex-wrap gap-2">
        {["", "PENDING", "APPROVED", "REJECTED"].map((s) => (
          <Link
            key={s}
            href={s ? `/admin/reviews?status=${s}` : "/admin/reviews"}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${status === s || (!status && !s) ? "bg-brand-ink text-white" : "border border-black/10 text-black/60"}`}
          >
            {s || "All"}
          </Link>
        ))}
      </div>

      <AdminTable>
        <thead>
          <tr>
            <AdminTh>Product</AdminTh>
            <AdminTh>Review</AdminTh>
            <AdminTh>Rating</AdminTh>
            <AdminTh>Date</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh>Actions</AdminTh>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <tr key={r.id} className="hover:bg-brand-cream/40">
              <AdminTd>
                <Link href={`/product/${r.product.slug}`} className="text-brand-primary hover:underline">
                  {r.product.name}
                </Link>
              </AdminTd>
              <AdminTd className="max-w-[280px]">
                <p className="font-medium text-brand-ink">{r.title}</p>
                <p className="line-clamp-2 text-xs text-black/50">{r.comment}</p>
                <p className="mt-1 text-xs text-black/40">— {r.authorName}</p>
              </AdminTd>
              <AdminTd>
                <Rating value={r.rating} />
              </AdminTd>
              <AdminTd className="text-black/50">{formatDate(r.createdAt)}</AdminTd>
              <AdminTd>
                <Badge variant={statusStyle[r.status]}>{r.status}</Badge>
              </AdminTd>
              <AdminTd>
                <ReviewRowActions id={r.id} status={r.status} adminReply={r.adminReply} />
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  );
}
