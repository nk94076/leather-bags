import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ShopPagination({
  basePath,
  searchParams,
  page,
  totalPages,
}: {
  basePath: string;
  searchParams: Record<string, string | undefined>;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(p: number) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v && k !== "page") params.set(k, v);
    });
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav className="mt-12 flex items-center justify-center gap-2">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border border-black/10",
          page === 1 && "pointer-events-none opacity-30"
        )}
      >
        <ChevronLeft size={16} />
      </Link>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-black/30">…</span>}
          <Link
            href={hrefFor(p)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border text-sm",
              p === page ? "border-brand-primary bg-brand-primary text-white" : "border-black/10 hover:bg-brand-cream"
            )}
          >
            {p}
          </Link>
        </span>
      ))}
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border border-black/10",
          page === totalPages && "pointer-events-none opacity-30"
        )}
      >
        <ChevronRight size={16} />
      </Link>
    </nav>
  );
}
