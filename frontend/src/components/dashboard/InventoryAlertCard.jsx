import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WidgetSkeleton } from "./WidgetSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";

export function InventoryAlertCard({ data, status, error, onRetry }) {
  const isLoading = status === "loading" || status === "idle";
  const isFailed  = status === "failed";
  const items     = data || [];

  return (
    <Card className="hover:card-shadow-elevated transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Inventory Alerts</CardTitle>
            <CardDescription>Ingredients at or below minimum stock</CardDescription>
          </div>
          {!isLoading && !isFailed && items.length > 0 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-danger-bg">
              <AlertTriangle className="h-3.5 w-3.5 text-danger" strokeWidth={2} />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isFailed ? (
          <ErrorState message={error || "Couldn't load inventory alerts."} onRetry={onRetry} compact />
        ) : isLoading ? (
          <WidgetSkeleton rows={4} className="h-11" />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-bg">
              <CheckCircle2 className="h-6 w-6 text-success" strokeWidth={1.75} />
            </div>
            <p className="text-sm font-semibold text-text-primary">All stock healthy</p>
            <p className="text-xs text-text-secondary">No alerts at this time</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.slice(0, 5).map((item) => {
              const isOut = Number(item.current_stock) <= 0;
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-xs text-text-secondary">
                      {item.current_stock} {item.unit} remaining · min {item.minimum_stock} {item.unit}
                    </p>
                  </div>
                  <Badge variant={isOut ? "danger" : "warning"} className="shrink-0 text-[11px]">
                    {isOut ? "Out of stock" : "Low stock"}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
