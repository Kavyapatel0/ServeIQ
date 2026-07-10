import { Flame } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { WidgetSkeleton } from "./WidgetSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { formatCurrency, formatNumber } from "@/utils/format";

/** `data` is the array from GET /api/analytics/top-items?limit=5. */
export function TopSellingCard({ data, status, error, onRetry }) {
  const isLoading = status === "loading" || status === "idle";
  const isFailed = status === "failed";
  const items = data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Items</CardTitle>
        <CardDescription>By quantity sold, all time</CardDescription>
      </CardHeader>
      <CardContent>
        {isFailed ? (
          <ErrorState message={error || "Couldn't load top items."} onRetry={onRetry} />
        ) : isLoading ? (
          <WidgetSkeleton rows={5} className="h-10" />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Flame}
            title="No sales recorded yet"
            description="Once orders are paid, your best sellers will show up here."
          />
        ) : (
          <ul className="space-y-1">
            {items.map((item, i) => (
              <li key={item.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-app-bg">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-600">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-primary">{item.item_name}</p>
                  <p className="text-xs text-text-secondary">
                    {formatNumber(item.total_quantity)} sold · {item.category_name || "Uncategorized"}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-text-primary">
                  {formatCurrency(item.total_revenue)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}