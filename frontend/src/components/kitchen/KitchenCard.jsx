import { motion } from "framer-motion";
import { Clock, User, ChefHat } from "lucide-react";

import { KitchenTimer } from "./KitchenTimer";
import { StatusButton } from "./StatusButton";
import { formatDateTime } from "@/utils/format";

const STATUS_CONFIG = {
  PENDING: { color: "border-l-gray-400 bg-white" },
  PREPARING: { color: "border-l-amber-400 bg-amber-50/30" },
  READY: { color: "border-l-green-400 bg-green-50/30" },
  SERVED: { color: "border-l-blue-400 bg-blue-50/30" },
};

/**
 * `order` here is a flat row from GET /api/kitchen/orders — it does
 * NOT include line items (only the single-order endpoint does). The
 * card shows what the queue view actually has (order #, table,
 * customer/waiter, elapsed time, chef if assigned); tapping the card
 * opens a detail dialog that fetches the full item list on demand.
 */
export function KitchenCard({ order, onStatusChange, onOpenDetails, loading, canAdvance }) {
  const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      onClick={() => onOpenDetails(order)}
      className={`cursor-pointer rounded-xl border border-border border-l-4 ${config.color} p-4 shadow-sm transition-shadow hover:shadow-md`}
    >
      {/* Header row */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <span className="text-base font-bold text-text-primary">{order.order_number}</span>
          {order.table_number && (
            <span className="ml-2 rounded-full bg-navy-800 px-2 py-0.5 text-xs font-semibold text-white">
              T{order.table_number}
            </span>
          )}
        </div>
        <KitchenTimer createdAt={order.created_at} status={order.status} />
      </div>

      {/* Customer / waiter */}
      <div className="mb-2 space-y-0.5">
        {order.customer_name && (
          <p className="truncate text-xs text-text-secondary">
            <User className="mr-1 inline h-3 w-3" />
            {order.customer_name}
          </p>
        )}
        {order.waiter_name && (
          <p className="truncate text-xs text-text-secondary">Waiter: {order.waiter_name}</p>
        )}
        {order.chef_name && (
          <p className="truncate text-xs text-text-secondary">
            <ChefHat className="mr-1 inline h-3 w-3" />
            {order.chef_name}
          </p>
        )}
      </div>

      {/* Notes */}
      {order.notes && (
        <p className="mb-3 rounded-lg bg-amber-50 px-2 py-1 text-xs italic text-amber-600">
          📝 {order.notes}
        </p>
      )}

      {/* Time */}
      <p className="mb-3 text-[11px] text-text-secondary">
        <Clock className="mr-1 inline h-3 w-3" />
        {formatDateTime(order.created_at)}
      </p>

      {/* Status button */}
      <StatusButton
        currentStatus={order.status}
        onUpdate={(newStatus) => onStatusChange(order, newStatus)}
        loading={loading}
        canAdvance={canAdvance}
      />
    </motion.div>
  );
}