import { cn } from "@/utils/cn";

export function WidgetSkeleton({ rows = 3, className }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={cn("animate-pulse rounded-xl bg-warm-200", className ?? "h-10")}
          style={{ opacity: 1 - i * 0.15 }}
        />
      ))}
    </div>
  );
}
