import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

const CATEGORY_ICONS = {
  "All":         "✦",
  "Main Course": "🍽",
  "Starters":    "🥗",
  "Soups":       "🍲",
  "Desserts":    "🍰",
  "Beverages":   "☕",
  "Breads":      "🫓",
  "Street Food": "🌮",
};

export function CategorySidebar({ categories = [], activeId, onSelect }) {
  return (
    <aside className="flex h-full flex-col gap-1.5 overflow-y-auto py-3 scrollbar-thin px-2">
      <CategoryButton
        label="All" emoji="✦"
        active={activeId === null}
        onClick={() => onSelect(null)}
      />
      {categories.map((cat) => (
        <CategoryButton
          key={cat.id}
          label={cat.name}
          emoji={CATEGORY_ICONS[cat.name] ?? "🍴"}
          active={activeId === cat.id}
          onClick={() => onSelect(cat.id)}
        />
      ))}
    </aside>
  );
}

function CategoryButton({ label, emoji, active, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex w-full flex-col items-center gap-1 rounded-xl px-1 py-3 text-center transition-all duration-150",
        active
          ? "bg-primary-500 text-white shadow-soft"
          : "bg-surface text-text-secondary hover:bg-primary-50 hover:text-primary-700 border border-warm-200"
      )}
    >
      <span className="text-xl leading-none">{emoji}</span>
      <span className={cn(
        "text-[10px] font-semibold leading-tight",
        active ? "text-white" : "text-text-secondary"
      )}>
        {label}
      </span>
    </motion.button>
  );
}
