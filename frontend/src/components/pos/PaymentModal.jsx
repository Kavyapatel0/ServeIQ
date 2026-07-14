import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Wallet, Smartphone, CheckCircle2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { selectPaymentMethod, setPaymentMethod } from "@/redux/slices/cartSlice";
import { Overlay, ModalHeader } from "./CouponModal";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";

const METHODS = [
  { value: "CASH", label: "Cash",   icon: Wallet,      bg: "bg-success-bg",  text: "text-success",  ring: "border-success/40" },
  { value: "CARD", label: "Card",   icon: CreditCard,  bg: "bg-info-bg",     text: "text-info",     ring: "border-info/40"    },
  { value: "UPI",  label: "UPI",    icon: Smartphone,  bg: "bg-accent-50",   text: "text-accent-600", ring: "border-accent-200" },
];

export function PaymentModal({ open, onClose, onConfirm, total, loading }) {
  const dispatch = useDispatch();
  const method   = useSelector(selectPaymentMethod);
  const [tendered, setTendered] = useState("");

  const change        = method === "CASH" && tendered ? Math.max(0, Number(tendered) - total) : null;
  const shortfall     = method === "CASH" && tendered && Number(tendered) < total;
  const canConfirm    = !loading && !(method === "CASH" && tendered && shortfall);

  if (!open) return null;

  return (
    <Overlay onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="relative w-full max-w-sm overflow-hidden rounded-dialog border border-warm-200 bg-surface shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#355c4b,#4d9e84,#c46a2d)" }} />

        {/* Amount header */}
        <div className="px-6 py-5" style={{ background: "linear-gradient(135deg,#355c4b,#28473a)" }}>
          <p className="text-sm font-medium text-forest-200">Grand Total</p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-white tabular-nums">
            {formatCurrency(total)}
          </p>
        </div>

        <div className="space-y-4 p-6">
          <ModalHeader title="Payment Method" onClose={onClose} />

          {/* Method selector */}
          <div className="grid grid-cols-3 gap-2.5">
            {METHODS.map((m) => {
              const active = method === m.value;
              return (
                <button
                  key={m.value}
                  onClick={() => dispatch(setPaymentMethod(m.value))}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all duration-150",
                    active
                      ? "border-primary-500 bg-primary-50"
                      : "border-warm-200 bg-warm-50 hover:border-warm-300 hover:bg-warm-100"
                  )}
                >
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", m.bg)}>
                    <m.icon className={cn("h-5 w-5", m.text)} strokeWidth={1.75} />
                  </div>
                  <span className="text-xs font-semibold text-text-primary">{m.label}</span>
                  {active && <CheckCircle2 className="h-3.5 w-3.5 text-primary-600" strokeWidth={2} />}
                </button>
              );
            })}
          </div>

          {/* Cash tendered */}
          {method === "CASH" && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                Amount Tendered (₹)
              </label>
              <input
                type="number"
                value={tendered}
                onChange={(e) => setTendered(e.target.value)}
                placeholder={total.toString()}
                className="w-full rounded-input border border-warm-200 bg-warm-50 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-disabled outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all tabular-nums"
              />
              {change !== null && !shortfall && tendered && (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-success-text">
                  Change: {formatCurrency(change)}
                </p>
              )}
              {shortfall && (
                <p className="mt-1.5 text-sm font-semibold text-danger-text">
                  Amount is ₹{(total - Number(tendered)).toFixed(2)} short
                </p>
              )}
            </div>
          )}

          {/* Confirm */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onConfirm(method, tendered ? Number(tendered) : total)}
            disabled={!canConfirm}
            className="w-full rounded-input py-3.5 text-sm font-bold text-white shadow-soft transition-all hover:shadow-card disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: canConfirm ? "linear-gradient(135deg,#355c4b,#28473a)" : "#b8a898" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Processing…
              </span>
            ) : (
              `Confirm ${method} Payment · ${formatCurrency(total)}`
            )}
          </motion.button>
        </div>
      </motion.div>
    </Overlay>
  );
}
