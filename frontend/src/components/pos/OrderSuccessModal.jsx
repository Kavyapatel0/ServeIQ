import { motion } from "framer-motion";
import { CheckCircle2, RotateCcw, UtensilsCrossed } from "lucide-react";
import { Overlay } from "./CouponModal";
import { formatCurrency } from "@/utils/format";

export function OrderSuccessModal({ open, order, onNewOrder }) {
  if (!open || !order) return null;

  return (
    <Overlay onClose={onNewOrder}>
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 22, stiffness: 320 }}
        className="relative w-full max-w-sm overflow-hidden rounded-dialog border border-warm-200 bg-surface p-0 shadow-modal text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top gradient band */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#355c4b,#4d9e84,#c46a2d)" }} />

        <div className="px-8 pb-8 pt-6">
          {/* Animated success icon */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring", damping: 14, stiffness: 380 }}
            className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-success-bg ring-4 ring-success/20"
          >
            <CheckCircle2 className="h-10 w-10 text-success" strokeWidth={1.75} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">Order Confirmed!</h2>
            <p className="mt-1.5 text-sm text-text-secondary">
              Order #{order.order_number ?? order.id} sent to the kitchen.
            </p>
          </motion.div>

          {/* Summary card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-6 space-y-2 rounded-xl border border-warm-200 bg-warm-50 p-4 text-left text-sm"
          >
            {[
              { label: "Table",    value: order.table?.table_number ?? "Takeaway" },
              { label: "Amount",   value: formatCurrency(order.total_amount ?? order.final_amount), bold: true, accent: true },
              { label: "Payment",  value: order.payment_method ?? "Cash" },
            ].map(({ label, value, bold, accent }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-text-secondary">{label}</span>
                <span className={`font-${bold ? "bold" : "semibold"} ${accent ? "text-accent-600" : "text-text-primary"}`}>
                  {value}
                </span>
              </div>
            ))}
          </motion.div>

          {/* New order button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNewOrder}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-input py-3 text-sm font-bold text-white shadow-soft transition-all hover:shadow-card"
            style={{ background: "linear-gradient(135deg,#355c4b,#28473a)" }}
          >
            <RotateCcw className="h-4 w-4" strokeWidth={2} />
            Start New Order
          </motion.button>
        </div>
      </motion.div>
    </Overlay>
  );
}
