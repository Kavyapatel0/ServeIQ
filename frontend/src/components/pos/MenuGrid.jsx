import { AnimatePresence } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";
import { MenuCard } from "./MenuCard";
import { EmptyState } from "@/components/common/EmptyState";

export function MenuGrid({ items = [], loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-card border border-warm-200 bg-surface">
            <div className="h-32 rounded-t-card bg-warm-200" style={{ opacity: 1 - i * 0.08 }} />
            <div className="space-y-2 p-3">
              <div className="h-3 w-3/4 rounded bg-warm-200" />
              <div className="h-3 w-1/2 rounded bg-warm-200" />
              <div className="mt-3 flex justify-between">
                <div className="h-4 w-16 rounded bg-warm-200" />
                <div className="h-7 w-7 rounded-lg bg-warm-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={UtensilsCrossed}
        title="No menu items found"
        description="Try a different category or clear your search."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <MenuCard key={item.id} item={item} />
        ))}
      </AnimatePresence>
    </div>
  );
}
