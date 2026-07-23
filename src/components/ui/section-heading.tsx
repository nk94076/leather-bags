import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-primary">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl font-medium text-brand-ink sm:text-4xl">{title}</h2>
      {description && (
        <p className={cn("max-w-2xl text-sm text-black/60 sm:text-base", align === "center" && "mx-auto")}>
          {description}
        </p>
      )}
    </div>
  );
}
