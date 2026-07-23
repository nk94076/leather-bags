import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl text-brand-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-black/50">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function AdminCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-2xl border border-black/5 bg-white p-6", className)}>{children}</div>;
}

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  href,
  accent = "text-brand-primary",
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href?: string;
  accent?: string;
}) {
  const content = (
    <div className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-5 transition hover:shadow-luxury">
      <span className={cn("flex h-12 w-12 items-center justify-center rounded-full bg-brand-cream", accent)}>
        <Icon size={20} />
      </span>
      <div>
        <p className="font-display text-2xl text-brand-ink">{value}</p>
        <p className="text-xs text-black/50">{label}</p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export function AdminTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">{children}</table>
    </div>
  );
}

export function AdminTh({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn("border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40", className)}>
      {children}
    </th>
  );
}

export function AdminTd({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("border-b border-black/5 px-4 py-3.5 align-middle", className)}>{children}</td>;
}
