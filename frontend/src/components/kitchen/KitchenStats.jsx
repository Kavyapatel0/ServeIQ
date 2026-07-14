import { motion } from "framer-motion";
import { Clock3, Flame, CheckCircle2, PackageCheck } from "lucide-react";
import { cn } from "@/utils/cn";

const CARDS = [
  {
    key:    "pending",
    label:  "Pending",
    icon:   Clock3,
    iconBg: "bg-warm-200",
    iconCl: "text-warm-600",
    bar:    "bg-warm-400",
  },
  {
    key:    "preparing",
    label:  "Preparing",
    icon:   Flame,
    iconBg: "bg-warning-bg",
    iconCl: "text-warning",
    bar:    "bg-warning",
  },
  {
    key:    "ready",
    label:  "Ready",
    icon:   CheckCircle2,
    iconBg: "bg-success-bg",
    iconCl: "text-success",
    bar:    "bg-success",
  },
  {
    key:    "served_today",
    label:  "Served Today",
    icon:   PackageCheck,
    iconBg: "bg-primary-100",
    iconCl: "text-primary-600",
    bar:    "bg-primary-500",
  },
];

export function KitchenStats({ data, status }) {
  const isLoading = status === "loading" || status === "idle";

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {CARDS.map((card, i) => {
        const value = data?.[card.key] ?? 0;
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative overflow-hidden rounded-card border border-warm-200 bg-surface p-4 card-shadow"
          >
            {/* Colored top bar */}
            <div className={cn("absolute inset-x-0 top-0 h-1 rounded-t-card", card.bar)} />

            <div className="flex items-center gap-3 pt-1">
              <span className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                card.iconBg
              )}>
                <card.icon className={cn("h-5 w-5", card.iconCl)} strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                  {card.label}
                </p>
                {isLoading ? (
                  <div className="mt-1 h-6 w-8 animate-pulse rounded bg-warm-200" />
                ) : (
                  <p className="text-2xl font-bold text-text-primary tabular-nums leading-tight">
                    {value}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
