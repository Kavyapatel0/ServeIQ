import { motion, AnimatePresence } from "framer-motion";
import { ChefHat } from "lucide-react";
import { KitchenCard } from "./KitchenCard";
import { cn } from "@/utils/cn";

const COLUMN_CONFIG = {
  PENDING: {
    label:     "Pending",
    emoji:     "⏳",
    headerBg:  "bg-warm-100 border-warm-200",
    headerText:"text-warm-700",
    countBg:   "bg-warm-400",
    colBg:     "bg-warm-50/60",
  },
  PREPARING: {
    label:     "Preparing",
    emoji:     "🔥",
    headerBg:  "bg-warning-bg border-warning/20",
    headerText:"text-warning-text",
    countBg:   "bg-warning",
    colBg:     "bg-orange-50/30",
  },
  READY: {
    label:     "Ready",
    emoji:     "✅",
    headerBg:  "bg-success-bg border-success/20",
    headerText:"text-success-text",
    countBg:   "bg-success",
    colBg:     "bg-green-50/30",
  },
  SERVED: {
    label:     "Served",
    emoji:     "🍽",
    headerBg:  "bg-primary-50 border-primary-200",
    headerText:"text-primary-700",
    countBg:   "bg-primary-500",
    colBg:     "bg-primary-50/20",
  },
};

export function KitchenColumn({ status, orders, onStatusChange, onOpenDetails, updatingId, canAdvance, dimmed }) {
  const cfg = COLUMN_CONFIG[status];

  return (
    <div
      className={cn(
        "flex flex-col rounded-card border border-warm-200 overflow-hidden transition-opacity duration-200",
        cfg.colBg,
        dimmed && "opacity-35 pointer-events-none"
      )}
      style={{ height: "520px" }}
    >
      {/* Fixed header — sits inside overflow-hidden container so it never scrolls */}
      <div className={cn(
        "flex shrink-0 items-center gap-2 border-b px-4 py-3",
        cfg.headerBg
      )}>
        <span className="text-base leading-none">{cfg.emoji}</span>
        <h3 className={cn("flex-1 font-bold text-sm", cfg.headerText)}>{cfg.label}</h3>
        <span className={cn(
          "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white",
          cfg.countBg
        )}>
          {orders.length}
        </span>
      </div>

      {/* Scrollable cards area — takes remaining height */}
      <div className="scrollbar-thin flex-1 space-y-2.5 overflow-y-auto p-2.5">
        <AnimatePresence mode="popLayout">
          {orders.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-40 flex-col items-center justify-center text-center"
            >
              <ChefHat className="mb-2 h-7 w-7 text-warm-300" strokeWidth={1.25} />
              <p className="text-xs font-medium text-text-disabled">No orders</p>
            </motion.div>
          ) : (
            orders.map(order => (
              <KitchenCard
                key={order.id}
                order={order}
                onStatusChange={onStatusChange}
                onOpenDetails={onOpenDetails}
                loading={updatingId === order.id}
                canAdvance={canAdvance}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}