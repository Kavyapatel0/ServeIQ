import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { WidgetSkeleton } from "./WidgetSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { cn } from "@/utils/cn";

const STAGES = [
  { key: "pending", label: "Pending", barClass: "bg-amber-500", textClass: "text-amber-600" },
  { key: "preparing", label: "Preparing", barClass: "bg-blue-500", textClass: "text-blue-600" },
  { key: "ready", label: "Ready", barClass: "bg-green-500", textClass: "text-green-600" },
  { key: "served_today", label: "Served Today", barClass: "bg-navy-600", textClass: "text-navy-700" },
];

/** `data` is the raw payload from GET /api/kitchen/dashboard. */
export function KitchenStatusCard({ data, status, error, onRetry }) {
  const isLoading = status === "loading" || status === "idle";
  const isFailed = status === "failed";
  const max = data ? Math.max(1, ...STAGES.map((s) => data[s.key] || 0)) : 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kitchen Status</CardTitle>
        <CardDescription>Live order queue right now</CardDescription>
      </CardHeader>
      <CardContent>
        {isFailed ? (
          <ErrorState message={error || "Couldn't load kitchen status."} onRetry={onRetry} />
        ) : isLoading ? (
          <WidgetSkeleton rows={4} className="h-9" />
        ) : (
          <div className="space-y-4">
            {STAGES.map((stage) => {
              const count = data?.[stage.key] || 0;
              return (
                <div key={stage.key}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-text-primary">{stage.label}</span>
                    <span className={cn("font-semibold", stage.textClass)}>{count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-app-bg">
                    <div
                      className={cn("h-full rounded-full transition-all duration-300", stage.barClass)}
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}