import { useNavigate } from "react-router-dom";
import { ClipboardList } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WidgetSkeleton } from "./WidgetSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { ROUTES } from "@/constants/routes";
import { formatCurrency } from "@/utils/format";

const STATUS_VARIANT = {
  CREATED: "info",
  PREPARING: "warning",
  READY: "warning",
  SERVED: "brand",
  PAID: "success",
  COMPLETED: "success",
  CANCELLED: "danger",
};

/** `data` is the trimmed array (max 5) returned by dashboardService.getRecentOrders(). */
export function RecentOrdersTable({ data, status, error, onRetry }) {
  const navigate = useNavigate();
  const isLoading = status === "loading" || status === "idle";
  const isFailed = status === "failed";
  const orders = data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>The 5 most recent orders across your branch</CardDescription>
      </CardHeader>
      <CardContent>
        {isFailed ? (
          <ErrorState message={error || "Couldn't load recent orders."} onRetry={onRetry} />
        ) : isLoading ? (
          <WidgetSkeleton rows={5} className="h-12" />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No orders yet today"
            description="Orders placed at the POS will show up here as soon as they come in."
          />
        ) : (
          <div className="-mx-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
                  <th className="px-6 py-2 font-medium">Order</th>
                  <th className="px-6 py-2 font-medium">Table / Customer</th>
                  <th className="px-6 py-2 font-medium">Amount</th>
                  <th className="px-6 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-app-bg"
                    onClick={() => navigate(ROUTES.POS)}
                  >
                    <td className="px-6 py-3 font-medium text-text-primary">{order.order_number}</td>
                    <td className="px-6 py-3 text-text-secondary">
                      {order.table_number ? `Table ${order.table_number}` : order.customer_name || "Walk-in"}
                    </td>
                    <td className="px-6 py-3 text-text-primary">{formatCurrency(order.grand_total)}</td>
                    <td className="px-6 py-3">
                      <Badge variant={STATUS_VARIANT[order.status] || "outline"}>{order.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
      {!isLoading && !isFailed && orders.length > 0 && (
        <div className="border-t border-border px-6 py-3">
          <Button variant="link" size="sm" onClick={() => navigate(ROUTES.POS)}>
            View all in POS →
          </Button>
        </div>
      )}
    </Card>
  );
}