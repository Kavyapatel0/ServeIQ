import { motion } from "framer-motion";
import { Flame, TrendingUp } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { WidgetSkeleton } from "./WidgetSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { formatCurrency, formatNumber } from "@/utils/format";

export function TopSellingCard({ data, status, error, onRetry }) {
  const isLoading = status === "loading" || status === "idle";
  const isFailed  = status === "failed";
  const items     = data || [];
  const maxQty    = items[0]?.total_quantity ?? 1;

  return (
    <Card className="hover:card-shadow-elevated transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Top Selling Items</CardTitle>
            <CardDescription>By quantity sold, all time</CardDescription>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-50">
            <Flame className="h-4 w-4 text-accent-500" strokeWidth={1.75} />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isFailed ? (
          <ErrorState message={error || "Couldn't load top items."} onRetry={onRetry} compact />
        ) : isLoading ? (
          <WidgetSkeleton rows={5} className="h-10" />
        ) : items.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No sales data yet"
            description="Best sellers will appear once orders are completed."
            compact
          />
        ) : (
          <ul className="space-y-3">
            {items.map((item, i) => {
              const pct = Math.round(((item.total_quantity ?? 0) / maxQty) * 100);
              return (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    {/* Rank badge */}
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold"
                      style={{
                        background: i === 0 ? "#fdf5e0" : i === 1 ? "#f0f6f3" : "#f6f1e8",
                        color: i === 0 ? "#8a640f" : i === 1 ? "#2d5c2c" : "#72675c",
                      }}
                    >
                      {i + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="truncate text-sm font-semibold text-text-primary">
                          {item.item_name}
                        </p>
                        <p className="ml-2 shrink-0 text-xs font-bold text-accent-600">
                          {formatCurrency(item.total_revenue)}
                        </p>
                      </div>
                      {/* Progress bar */}
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-warm-200">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 + i * 0.06 }}
                          className="h-full rounded-full"
                          style={{
                            background: i === 0
                              ? "linear-gradient(90deg,#355c4b,#4d9e84)"
                              : "linear-gradient(90deg,#c46a2d80,#c46a2d)",
                          }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-text-secondary">
                        {formatNumber(item.total_quantity)} sold · {item.category_name || "Uncategorized"}
                      </p>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
