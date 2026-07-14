import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/utils/cn";

const ACCENT_MAP = {
  brand:   { icon: "bg-primary-100 text-primary-600",  border: "border-primary-200/60" },
  success: { icon: "bg-success-bg text-success",        border: "border-green-200/60"   },
  danger:  { icon: "bg-danger-bg text-danger",          border: "border-red-200/60"     },
  warning: { icon: "bg-warning-bg text-warning",        border: "border-yellow-200/60"  },
  info:    { icon: "bg-info-bg text-info",              border: "border-blue-200/60"    },
  accent:  { icon: "bg-accent-100 text-accent-600",    border: "border-accent-200/60"  },
};

export function StatCard({ label, value, icon: Icon, trend, accent = "brand", className, subtitle }) {
  const style = ACCENT_MAP[accent] ?? ACCENT_MAP.brand;

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={cn(
        "relative overflow-hidden rounded-card border bg-surface p-5 card-shadow",
        "transition-shadow duration-200 hover:card-shadow-elevated",
        style.border,
        className
      )}
    >
      {/* Subtle top-left accent bar */}
      <div className={cn("absolute left-0 top-0 h-1 w-12 rounded-br-sm rounded-tl-card",
        accent === "brand"   && "bg-primary-500",
        accent === "accent"  && "bg-accent-500",
        accent === "success" && "bg-success",
        accent === "danger"  && "bg-danger",
        accent === "warning" && "bg-warning",
        accent === "info"    && "bg-info",
      )} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary tabular-nums">
            {value}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-text-secondary">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
              trend.direction === "up"
                ? "bg-success-bg text-success-text"
                : "bg-danger-bg text-danger-text"
            )}>
              {trend.direction === "up"
                ? <TrendingUp className="h-3 w-3" />
                : <TrendingDown className="h-3 w-3" />}
              {trend.value}
              <span className="font-normal text-text-secondary ml-0.5">vs last period</span>
            </div>
          )}
        </div>

        {Icon && (
          <div className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            style.icon
          )}>
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
