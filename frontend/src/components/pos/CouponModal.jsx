import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tag, CheckCircle, AlertCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { applyCoupon, selectCartTotals } from "@/redux/slices/cartSlice";
import { validateCoupon } from "@/services/posApi";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";

// ─── Shared overlay & header used by all POS modals ──────────────────────

export function Overlay({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(21,36,25,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      {children}
    </div>
  );
}

export function ModalHeader({ title, icon: Icon, onClose }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-100">
            <Icon className="h-4 w-4 text-primary-600" strokeWidth={2} />
          </div>
        )}
        <h2 className="text-base font-bold text-text-primary tracking-tight">{title}</h2>
      </div>
      <button
        onClick={onClose}
        className="flex h-8 w-8 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-warm-200 hover:text-text-primary"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Coupon Modal ─────────────────────────────────────────────────────────

export function CouponModal({ open, onClose }) {
  const dispatch = useDispatch();
  const totals   = useSelector(selectCartTotals);
  const [code, setCode]     = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleValidate = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await validateCoupon(code.trim().toUpperCase(), totals.subtotal);
      setResult({ success: true, coupon: data });
    } catch (err) {
      setResult({ success: false, message: err.message ?? "Invalid coupon code." });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result?.coupon) { dispatch(applyCoupon(result.coupon)); onClose(); }
  };

  if (!open) return null;

  return (
    <Overlay onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-sm rounded-dialog border border-warm-200 bg-surface p-6 shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader title="Apply Coupon" icon={Tag} onClose={onClose} />

        <p className="mb-4 text-sm text-text-secondary leading-relaxed">
          Enter a coupon code to apply a discount to this order.
        </p>

        <div className="flex gap-2">
          <input
            autoFocus
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleValidate()}
            placeholder="e.g. WELCOME10"
            className={cn(
              "flex-1 rounded-input border bg-warm-50 px-4 py-2.5 text-sm font-mono uppercase tracking-widest",
              "text-text-primary placeholder:text-text-disabled",
              "outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
            )}
          />
          <button
            onClick={handleValidate}
            disabled={loading || !code.trim()}
            className="rounded-input bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "…" : "Check"}
          </button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                "mt-4 flex items-start gap-3 rounded-xl p-3",
                result.success
                  ? "border border-success/25 bg-success-bg"
                  : "border border-danger/25 bg-danger-bg"
              )}
            >
              {result.success
                ? <CheckCircle className="h-4 w-4 shrink-0 text-success mt-0.5" />
                : <AlertCircle className="h-4 w-4 shrink-0 text-danger mt-0.5" />}
              <div>
                {result.success ? (
                  <>
                    <p className="text-sm font-bold text-success-text">Coupon valid!</p>
                    <p className="text-xs text-success-text/80">
                      Saving {formatCurrency(result.coupon?.discount_amount ?? 0)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-medium text-danger-text">{result.message}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {result?.success && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleApply}
            className="mt-4 w-full rounded-input py-2.5 text-sm font-bold text-white transition-colors"
            style={{ background: "linear-gradient(135deg,#355c4b,#28473a)" }}
          >
            Apply Coupon
          </motion.button>
        )}
      </motion.div>
    </Overlay>
  );
}
