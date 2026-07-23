import { CheckCircle2, Circle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface TrackingStep {
  status: string;
  date: string;
  note: string;
}

const STEP_LABELS: Record<string, string> = {
  PENDING: "Order Placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function OrderTrackingTimeline({ history }: { history: TrackingStep[] }) {
  return (
    <ol className="flex flex-col gap-0">
      {history.map((step, i) => (
        <li key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <span className={cn("flex h-7 w-7 items-center justify-center rounded-full", step.status === "CANCELLED" ? "text-red-500" : "text-green-600")}>
              <CheckCircle2 size={22} />
            </span>
            {i < history.length - 1 && <span className="w-px flex-1 bg-black/10" />}
          </div>
          <div className="pb-8">
            <p className="text-sm font-semibold text-brand-ink">{STEP_LABELS[step.status] ?? step.status}</p>
            <p className="text-xs text-black/50">{step.note}</p>
            <p className="mt-0.5 text-xs text-black/35">{formatDate(step.date)}</p>
          </div>
        </li>
      ))}
      {history.length === 0 && (
        <li className="flex gap-4">
          <Circle size={22} className="text-black/20" />
          <p className="text-sm text-black/50">No tracking updates yet.</p>
        </li>
      )}
    </ol>
  );
}
