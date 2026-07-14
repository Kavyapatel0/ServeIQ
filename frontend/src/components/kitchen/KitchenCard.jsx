import { motion } from "framer-motion";
import { Clock, User, ChefHat } from "lucide-react";

import { KitchenTimer } from "./KitchenTimer";
import { StatusButton } from "./StatusButton";
import { formatDateTime } from "@/utils/format";
import { cn } from "@/utils/cn";

const STATUS_CONFIG = {
  PENDING:   { leftBar: "border-l-warm-400",    bg: "bg-surface" },
  PREPARING: { leftBar: "border-l-warning",      bg: "bg-warning-bg/30" },
  READY:     { leftBar: "border-l-success",      bg: "bg-success-bg/30" },
  SERVED:    { leftBar: "border-l-primary-400",  bg: "bg-primary-50/40" },
};

export function KitchenCard({ order, onStatusChange, onOpenDetails, loading, canAdvance }) {
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.2 }}
      onClick={() => onOpenDetails(order)}
      className={cn(
        "cursor-pointer rounded-xl border border-l-4 border-warm-200 p-4",
        "shadow-soft transition-all duration-150 hover:card-shadow-elevated hover:border-warm-300",
        cfg.leftBar, cfg.bg
      )}
    >
      {/* Header row: order # + table badge + timer */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-text-primary">
            {order.order_number}
          </span>
          {order.table_number && (
            <span className="rounded-full bg-forest-600 px-2 py-0.5 text-[10px] font-bold text-white">
              T{order.table_number}
            </span>
          )}
        </div>
        <KitchenTimer createdAt={order.created_at} status={order.status} />
      </div>

      {/* People info */}
      <div className="mb-2.5 space-y-1">
        {order.customer_name && (
          <p className="flex items-center gap-1.5 text-xs text-text-secondary truncate">
            <User className="h-3 w-3 shrink-0 text-text-disabled" />
            {order.customer_name}
          </p>
        )}
        {order.waiter_name && (
          <p className="text-xs text-text-secondary truncate pl-4">
            Waiter: {order.waiter_name}
          </p>
        )}
        {order.chef_name && (
          <p className="flex items-center gap-1.5 text-xs text-text-secondary truncate">
            <ChefHat className="h-3 w-3 shrink-0 text-text-disabled" />
            {order.chef_name}
          </p>
        )}
      </div>

      {/* Special notes */}
      {order.notes && (
        <div className="mb-3 rounded-lg border border-warning/20 bg-warning-bg px-2.5 py-1.5">
          <p className="text-[11px] italic text-warning-text">📝 {order.notes}</p>
        </div>
      )}

      {/* Timestamp */}
      <p className="mb-3 flex items-center gap-1 text-[11px] text-text-disabled">
        <Clock className="h-3 w-3" />
        {formatDateTime(order.created_at)}
      </p>

      {/* Action button */}
      <div onClick={(e) => e.stopPropagation()}>
        <StatusButton
          currentStatus={order.status}
          onUpdate={(newStatus) => onStatusChange(order, newStatus)}
          loading={loading}
          canAdvance={canAdvance}
        />
      </div>
    </motion.div>
  );
}
