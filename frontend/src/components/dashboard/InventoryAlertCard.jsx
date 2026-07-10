import { PackageX } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WidgetSkeleton } from "./WidgetSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";

/** `data` is the array from GET /api/inventory/low-stock. */
export function InventoryAlertCard({ data, status, error, onRetry }) {
  const isLoading = status === "loading" || status === "idle";
  const isFailed = status === "failed";
  const items = data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Alerts</CardTitle>
        <CardDescription>Ingredients at or below their minimum stock</CardDescription>
      </CardHeader>
      <CardContent>
        {isFailed ? (
          <ErrorState message={error || "Couldn't load inventory alerts."} onRetry={onRetry} />
        ) : isLoading ? (
          <WidgetSkeleton rows={4} className="h-11" />
        ) : items.length === 0 ? (
          <EmptyState
            icon={PackageX}
            title="Stock levels look healthy"
            description="No ingredients are currently at or below their minimum threshold."
          />
        ) : (
          <ul className="divide-y divide-border">
            {items.slice(0, 5).map((item) => {
              const isOut = Number(item.current_stock) <= 0;
              return (
                <li key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">{item.name}</p>
                    <p className="text-xs text-text-secondary">
                      {item.current_stock} {item.unit} left · min {item.minimum_stock} {item.unit}
                    </p>
                  </div>
                  <Badge variant={isOut ? "danger" : "warning"} className="shrink-0">
                    {isOut ? "Out of stock" : "Critical"}
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