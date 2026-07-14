import { useNavigate } from "react-router-dom";
import { ClipboardList, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WidgetSkeleton } from "./WidgetSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { ROUTES } from "@/constants/routes";
import { formatCurrency } from "@/utils/format";

const STATUS_MAP = {
  CREATED:   { variant: "info",    label: "New" },
  PREPARING: { variant: "warning", label: "Preparing" },
  READY:     { variant: "warning", label: "Ready" },
  SERVED:    { variant: "brand",   label: "Served" },
  PAID:      { variant: "success", label: "Paid" },
  COMPLETED: { variant: "success", label: "Completed" },
  CANCELLED: { variant: "danger",  label: "Cancelled" },
};

export function RecentOrdersTable({ data, status, error, onRetry }) {
  const navigate  = useNavigate();
  const isLoading = status === "loading" || status === "idle";
  const isFailed  = status === "failed";
  const orders    = data || [];

  return (
    <Card className="hover:card-shadow-elevated transition-shadow duration-200">
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>Latest 5 orders across your branch</CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {isFailed ? (
          <div className="p-6">
            <ErrorState message={error || "Couldn't load recent orders."} onRetry={onRetry} compact />
          </div>
        ) : isLoading ? (
          <div className="p-6">
            <WidgetSkeleton rows={5} className="h-12" />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={ClipboardList}
              title="No orders yet today"
              description="Orders placed at the POS will appear here in real time."
              compact
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Order
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Table / Guest
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => {
                  const s = STATUS_MAP[order.status] || { variant: "outline", label: order.status };
                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-warm-100"
                      onClick={() => navigate(ROUTES.POS)}
                    >
                      <td className="px-6 py-3.5 font-semibold text-text-primary">
                        {order.order_number}
                      </td>
                      <td className="px-6 py-3.5 text-text-secondary">
                        {order.table_number
                          ? <span className="font-medium">Table {order.table_number}</span>
                          : order.customer_name || "Walk-in"}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-text-primary tabular-nums">
                        {formatCurrency(order.grand_total)}
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge variant={s.variant} className="text-[11px]">{s.label}</Badge>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {!isLoading && !isFailed && orders.length > 0 && (
        <div className="border-t border-border px-6 py-3">
          <button
            onClick={() => navigate(ROUTES.POS)}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 transition-colors hover:text-primary-700"
          >
            View all in POS
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </Card>
  );
}
