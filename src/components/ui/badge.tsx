import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  variant = "solid",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "solid" | "outline" | "gold";
}) {
  const styles = {
    solid: "bg-brand-secondary text-white",
    outline: "border border-brand-secondary/30 text-brand-secondary bg-white/70",
    gold: "bg-brand-gold text-white",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
