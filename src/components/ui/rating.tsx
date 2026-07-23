import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({
  value,
  count,
  size = 14,
  className,
}: {
  value: number;
  count?: number;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= Math.round(value);
          return (
            <Star
              key={i}
              size={size}
              className={filled ? "fill-brand-gold text-brand-gold" : "fill-transparent text-black/20"}
            />
          );
        })}
      </div>
      {typeof count === "number" && (
        <span className="text-xs text-black/50">({count})</span>
      )}
    </div>
  );
}
