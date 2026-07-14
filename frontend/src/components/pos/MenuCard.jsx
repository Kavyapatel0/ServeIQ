import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Lock } from "lucide-react";
import { useDispatch } from "react-redux";
import { addItem } from "@/redux/slices/cartSlice";
import { formatCurrency } from "@/utils/format";
import { getMenuItemImage } from "@/utils/foodImages";
import { cn } from "@/utils/cn";

export function MenuCard({ item }) {
  const dispatch   = useDispatch();
  const unavailable = !item.is_available;
  const [imgError, setImgError] = useState(false);
  const imageUrl   = getMenuItemImage(item);

  const handleAdd = () => {
    if (unavailable) return;
    dispatch(addItem({
      id:        item.id,
      name:      item.name,
      price:     parseFloat(item.price),
      category:  item.category?.name,
      image_url: item.image_url,
    }));
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      whileHover={!unavailable ? { y: -3, transition: { duration: 0.15 } } : {}}
      onClick={handleAdd}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card border bg-surface transition-all duration-200",
        unavailable
          ? "cursor-not-allowed opacity-50 grayscale border-warm-200"
          : "cursor-pointer border-warm-200 hover:border-primary-300 hover:card-shadow-elevated card-shadow"
      )}
    >
      {/* ── Image ───────────────────────────────────────────────── */}
      <div className="relative h-32 w-full overflow-hidden bg-warm-100">
        {!imgError ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-warm-100">
            <span className="text-3xl" aria-hidden="true">🍽</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Category chip */}
        {item.category?.name && (
          <div className="absolute left-2 top-2">
            <span className="rounded-full bg-surface/90 px-2 py-0.5 text-[10px] font-semibold text-text-secondary backdrop-blur-sm shadow-xs">
              {item.category.name}
            </span>
          </div>
        )}

        {/* Unavailable overlay */}
        {unavailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-warm-900/40">
            <span className="rounded-full bg-surface/80 px-2.5 py-1 text-[11px] font-semibold text-text-secondary backdrop-blur-sm">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* ── Info ────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-3">
        <p className="line-clamp-2 flex-1 text-[13px] font-semibold leading-tight text-text-primary">
          {item.name}
        </p>
        {item.description && (
          <p className="mt-0.5 line-clamp-1 text-[11px] text-text-secondary">
            {item.description}
          </p>
        )}

        <div className="mt-2.5 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-accent-600">
            {formatCurrency(item.price)}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); handleAdd(); }}
            disabled={unavailable}
            aria-label={unavailable ? `${item.name} unavailable` : `Add ${item.name}`}
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-150",
              unavailable
                ? "cursor-not-allowed bg-warm-200 text-warm-400"
                : "bg-primary-500 text-white hover:bg-primary-600 active:scale-90 shadow-soft"
            )}
          >
            {unavailable
              ? <Lock className="h-3 w-3" />
              : <Plus className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
