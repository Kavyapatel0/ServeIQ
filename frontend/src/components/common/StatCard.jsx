import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

/**
 * The KPI card seen on Dashboard ("Today's Revenue", "Orders", etc.)
 * and reused on every module's overview strip (Inventory's "Low Stock",
 * CRM's "Loyalty Members", Kitchen's "Pending Orders"...).
 *
 * `trend` is optional: { value: "+12%", direction: "up" | "down" }
 */
export function StatCard({ label, value, icon: Icon, trend, accent = "brand", className }) {
  const accentStyles = {
    brand: "bg-brand-50 text-brand-600",
    success: "bg-success-bg text-green-600",
    danger: "bg-danger-bg text-red-600",
    warning: "bg-warning-bg text-amber-600",
    info: "bg-info-bg text-blue-600",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "rounded-card border border-border bg-card p-6 card-shadow transition-shadow hover:card-shadow-elevated",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-text-primary">{value}</p>
          {trend && (
            <p
              className={cn(
                "mt-2 inline-flex items-center text-xs font-medium",
                trend.direction === "up" ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.direction === "up" ? "↑" : "↓"} {trend.value}
              <span className="ml-1 font-normal text-text-secondary">vs last period</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", accentStyles[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
