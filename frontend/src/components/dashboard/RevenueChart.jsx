import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import dayjs from "dayjs";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { WidgetSkeleton } from "./WidgetSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { formatCurrency } from "@/utils/format";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-input border border-border bg-card px-3 py-2 card-shadow-elevated">
      <p className="text-xs font-medium text-text-secondary">{dayjs(label).format("D MMM")}</p>
      <p className="text-sm font-semibold text-text-primary">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

/**
 * Last-7-days revenue trend. `data` is the raw array from
 * GET /api/analytics/sales/daily?days=7 — [{ sale_date, revenue, order_count }].
 */
export function RevenueChart({ data, status, error, onRetry }) {
  const isLoading = status === "loading" || status === "idle";
  const isFailed = status === "failed";
  const chartData = (data || []).map((d) => ({ ...d, revenue: Number(d.revenue) }));

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        {isFailed ? (
          <ErrorState message={error || "Couldn't load revenue data."} onRetry={onRetry} />
        ) : isLoading ? (
          <WidgetSkeleton rows={1} className="h-64" />
        ) : chartData.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border text-sm text-text-secondary">
            No revenue recorded in the last 7 days yet.
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis
                  dataKey="sale_date"
                  tickFormatter={(d) => dayjs(d).format("D MMM")}
                  tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
                  tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-brand-500)"
                  strokeWidth={2}
                  fill="url(#revenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}