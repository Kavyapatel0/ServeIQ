import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import dayjs from "dayjs";
import { TrendingUp } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { WidgetSkeleton } from "./WidgetSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { formatCurrency } from "@/utils/format";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-warm-200 bg-surface px-4 py-3 shadow-elevated">
      <p className="text-xs font-semibold text-text-secondary mb-1">
        {dayjs(label).format("ddd, D MMM")}
      </p>
      <p className="text-base font-bold text-text-primary">
        {formatCurrency(payload[0].value)}
      </p>
      {payload[1] && (
        <p className="text-xs text-text-secondary mt-0.5">
          {payload[1].value} orders
        </p>
      )}
    </div>
  );
}

export function RevenueChart({ data, status, error, onRetry }) {
  const isLoading = status === "loading" || status === "idle";
  const isFailed  = status === "failed";
  const chartData = (data || []).map((d) => ({
    ...d,
    revenue: Number(d.revenue),
    orders:  Number(d.order_count || 0),
  }));

  const total = chartData.reduce((s, d) => s + d.revenue, 0);

  return (
    <Card className="lg:col-span-2 hover:card-shadow-elevated transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
            <CardDescription className="mt-0.5">Last 7 days</CardDescription>
          </div>
          {!isLoading && !isFailed && chartData.length > 0 && (
            <div className="flex items-center gap-1.5 rounded-xl bg-primary-50 px-3 py-1.5 ring-1 ring-primary-100">
              <TrendingUp className="h-3.5 w-3.5 text-primary-600" strokeWidth={2} />
              <span className="text-xs font-bold text-primary-700">
                {formatCurrency(total)}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {isFailed ? (
          <ErrorState message={error || "Couldn't load revenue data."} onRetry={onRetry} compact />
        ) : isLoading ? (
          <WidgetSkeleton rows={1} className="h-64" />
        ) : chartData.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-warm-300 text-center">
            <p className="text-sm font-medium text-text-secondary">No revenue recorded yet</p>
            <p className="text-xs text-text-disabled">Revenue data will appear once orders are completed</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -12, right: 4, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#355c4b" stopOpacity={0.20} />
                    <stop offset="100%" stopColor="#355c4b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#d8ccbe"
                  strokeOpacity={0.6}
                />
                <XAxis
                  dataKey="sale_date"
                  tickFormatter={(d) => dayjs(d).format("D MMM")}
                  tick={{ fontSize: 11, fill: "#72675c" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) =>
                    v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
                  }
                  tick={{ fontSize: 11, fill: "#72675c" }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#355c4b", strokeWidth: 1, strokeDasharray: "4 4" }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#355c4b"
                  strokeWidth={2.5}
                  fill="url(#revenueGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#355c4b", stroke: "#fffdf9", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
