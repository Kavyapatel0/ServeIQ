import { useEffect, useState } from "react";
import { Clock, User, ChefHat, Armchair } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getKitchenOrderById } from "@/services/kitchenApi";
import { formatCurrency, formatDateTime } from "@/utils/format";

const STATUS_VARIANT = {
  PENDING: "outline",
  PREPARING: "warning",
  READY: "success",
  SERVED: "info",
};

/**
 * Opened by tapping a KitchenCard. The board only has the flat list
 * fields, so this fetches the single-order endpoint (which joins in
 * Order_Items) the moment it opens, rather than requiring every card
 * in the queue to carry its full item list up front.
 */
export function OrderDetailDialog({ order, open, onOpenChange }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !order) return;
    let cancelled = false;
    setLoading(true);
    setDetail(null);

    getKitchenOrderById(order.id)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, order]);

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{order.order_number}</DialogTitle>
            <Badge variant={STATUS_VARIANT[order.status] || "outline"}>{order.status}</Badge>
          </div>
          <DialogDescription>Sent to kitchen {formatDateTime(order.created_at)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 border-y border-border py-4 text-sm">
          {order.table_number && (
            <div className="flex items-center gap-2 text-text-secondary">
              <Armchair className="h-4 w-4" /> Table {order.table_number}
            </div>
          )}
          {order.customer_name && (
            <div className="flex items-center gap-2 text-text-secondary">
              <User className="h-4 w-4" /> {order.customer_name}
            </div>
          )}
          {order.waiter_name && (
            <div className="flex items-center gap-2 text-text-secondary">
              <Clock className="h-4 w-4" /> Waiter: {order.waiter_name}
            </div>
          )}
          {order.chef_name && (
            <div className="flex items-center gap-2 text-text-secondary">
              <ChefHat className="h-4 w-4" /> Chef: {order.chef_name}
            </div>
          )}
        </div>

        <div className="pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Items</p>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {(detail?.items || []).map((item) => (
                <li key={item.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium text-text-primary">{item.item_name}</p>
                    <p className="text-xs text-text-secondary">{item.category_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-text-primary">×{item.quantity}</p>
                    <p className="text-xs text-text-secondary">{formatCurrency(item.unit_price)}</p>
                  </div>
                </li>
              ))}
              {!loading && (detail?.items || []).length === 0 && (
                <li className="py-2 text-sm text-text-secondary">No items found for this order.</li>
              )}
            </ul>
          )}
        </div>

        {order.notes && (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs italic text-amber-700">
            📝 {order.notes}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}