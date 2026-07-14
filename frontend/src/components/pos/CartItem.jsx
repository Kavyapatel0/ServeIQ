import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus } from "lucide-react";
import { incrementItem, decrementItem, removeItem } from "@/redux/slices/cartSlice";
import { formatCurrency } from "@/utils/format";
import { getMenuItemImage } from "@/utils/foodImages";
import { cn } from "@/utils/cn";

export function CartItem({ item }) {
  const dispatch = useDispatch();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.18 }}
      className="flex items-start gap-2.5 rounded-xl border border-warm-200 bg-surface p-2.5 card-shadow"
    >
      {/* Thumbnail */}
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-warm-100">
        <img
          src={getMenuItemImage(item)}
          alt={item.name}
          className="h-full w-full object-cover"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      </div>

      {/* Name + price */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-text-primary">{item.name}</p>
        <p className="text-xs text-text-secondary">{formatCurrency(item.price)} each</p>
        <p className="mt-0.5 text-xs font-bold text-accent-600">
          {formatCurrency(item.price * item.quantity)}
        </p>
      </div>

      {/* Qty controls */}
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => dispatch(decrementItem(item.id))}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-warm-100 text-text-secondary transition-colors hover:bg-primary-100 hover:text-primary-700"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-5 text-center text-sm font-bold tabular-nums text-text-primary">
            {item.quantity}
          </span>
          <button
            onClick={() => dispatch(incrementItem(item.id))}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-500 text-white transition-colors hover:bg-primary-600"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
        <button
          onClick={() => dispatch(removeItem(item.id))}
          className="flex h-6 w-6 items-center justify-center rounded-md text-warm-400 transition-colors hover:bg-danger-bg hover:text-danger"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </motion.div>
  );
}
