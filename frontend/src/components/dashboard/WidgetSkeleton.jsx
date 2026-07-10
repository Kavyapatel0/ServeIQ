import { Skeleton } from "@/components/ui/skeleton";

/** Generic N-row skeleton for widget bodies while their resource is loading. */
export function WidgetSkeleton({ rows = 3, className = "h-10" }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={`w-full ${className}`} />
      ))}
    </div>
  );
}