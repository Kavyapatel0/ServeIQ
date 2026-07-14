import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, X, User, ChevronsRight, ShoppingBag, Armchair } from "lucide-react";
import {
  selectCartItems, selectCartTotals, selectCoupon,
  selectCartCustomer, selectCartTable, removeCoupon,
} from "@/redux/slices/cartSlice";
import { CartItem } from "./CartItem";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";

export function BillingSummary({ onApplyCoupon, onSelectCustomer, onSelectTable, onCheckout }) {
  const items    = useSelector(selectCartItems);
  const totals   = useSelector(selectCartTotals);
  const coupon   = useSelector(selectCoupon);
  const customer = useSelector(selectCartCustomer);
  const table    = useSelector(selectCartTable);
  const dispatch = useDispatch();
  const isEmpty  = items.length === 0;

  return (
    <div className="flex h-full flex-col bg-surface">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-warm-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-primary-500" strokeWidth={2} />
          <h2 className="text-sm font-bold text-text-primary">Order</h2>
          {totals.itemCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1.5 text-[10px] font-bold text-white">
              {totals.itemCount}
            </span>
          )}
        </div>
        {/* Table selector */}
        <button
          onClick={onSelectTable}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all",
            table.id
              ? "bg-primary-50 text-primary-700 border border-primary-200 ring-1 ring-primary-200/50"
              : "bg-warm-100 text-text-secondary hover:bg-primary-50 hover:text-primary-700 border border-warm-200"
          )}
        >
          <Armchair className="h-3.5 w-3.5" strokeWidth={1.75} />
          {table.name ?? "Table"}
        </button>
      </div>

      {/* ── Cart Items ─────────────────────────────────────── */}
      <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto p-3">
        <AnimatePresence mode="popLayout">
          {items.map((item) => <CartItem key={item.id} item={item} />)}
        </AnimatePresence>
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex h-40 flex-col items-center justify-center text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-100">
              <ShoppingBag className="h-6 w-6 text-warm-400" strokeWidth={1.5} />
            </div>
            <p className="mt-3 text-sm font-semibold text-text-secondary">Cart is empty</p>
            <p className="text-xs text-text-disabled">Tap menu items to add them</p>
          </motion.div>
        )}
      </div>

      {/* ── Billing Panel ──────────────────────────────────── */}
      {!isEmpty && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-warm-200 bg-surface p-3 space-y-2.5"
        >
          {/* Customer selector */}
          <button
            onClick={onSelectCustomer}
            className="flex w-full items-center gap-2 rounded-xl border border-warm-200 bg-warm-50 px-3 py-2 text-left transition-all hover:border-primary-300 hover:bg-primary-50"
          >
            <User className="h-3.5 w-3.5 text-primary-500" strokeWidth={2} />
            <span className="flex-1 truncate text-xs text-text-secondary">
              {customer.name ?? "Walk-in Guest"}
            </span>
            {customer.name && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success text-white text-[9px] font-bold">✓</span>
            )}
          </button>

          {/* Coupon */}
          {coupon ? (
            <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success-bg px-3 py-2">
              <Tag className="h-3.5 w-3.5 text-success" strokeWidth={2} />
              <span className="flex-1 text-xs font-bold text-success-text">{coupon.code}</span>
              <span className="text-xs text-success-text">-{formatCurrency(coupon.discount_amount)}</span>
              <button onClick={() => dispatch(removeCoupon())} className="text-warm-400 hover:text-danger transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onApplyCoupon}
              className="flex w-full items-center gap-2 rounded-xl border border-dashed border-primary-300 bg-primary-50/50 px-3 py-2 text-xs text-primary-600 hover:bg-primary-50 transition-colors"
            >
              <Tag className="h-3.5 w-3.5" />
              Apply coupon or promo code
            </button>
          )}

          {/* Breakdown */}
          <div className="space-y-1.5 rounded-xl bg-warm-100 p-3 text-xs border border-warm-200">
            <BillRow label="Subtotal" value={formatCurrency(totals.subtotal)} />
            {totals.discountAmt > 0 && (
              <BillRow
                label="Coupon Discount"
                value={`-${formatCurrency(totals.discountAmt)}`}
                valueClass="text-success-text font-semibold"
              />
            )}
            <BillRow label={`GST (${totals.taxRate}%)`} value={formatCurrency(totals.tax)} />
            <div className="my-1 border-t border-warm-300" />
            <BillRow
              label="Grand Total"
              value={formatCurrency(totals.total)}
              bold
              valueClass="text-accent-600 text-sm"
            />
          </div>

          {/* Checkout CTA */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onCheckout}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-soft transition-shadow hover:shadow-card"
            style={{ background: "linear-gradient(135deg,#355c4b 0%,#28473a 100%)" }}
          >
            Proceed to Payment
            <ChevronsRight className="h-4 w-4" />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

function BillRow({ label, value, bold = false, valueClass = "" }) {
  return (
    <div className={cn("flex items-center justify-between", bold && "font-bold")}>
      <span className="text-text-secondary">{label}</span>
      <span className={cn("font-medium text-text-primary", valueClass)}>{value}</span>
    </div>
  );
}
