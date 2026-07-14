import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/utils/cn";

export function Logo({ variant = "light", collapsed = false, className }) {
  const isDark = variant === "dark";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Icon mark */}
      <div className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
        isDark
          ? "bg-white/15 ring-1 ring-white/25"
          : "bg-primary-500 shadow-soft"
      )}>
        <UtensilsCrossed
          className={cn("h-[18px] w-[18px]", isDark ? "text-white" : "text-white")}
          strokeWidth={2.25}
        />
      </div>

      {/* Wordmark */}
      {!collapsed && (
        <div className="leading-tight">
          <p className={cn(
            "text-[15px] font-bold tracking-tight",
            isDark ? "text-white" : "text-text-primary"
          )}>
            ServeIQ
          </p>
          <p className={cn(
            "text-[10px] font-medium tracking-wider uppercase",
            isDark ? "text-forest-200/70" : "text-text-secondary"
          )}>
            Fine Dining OS
          </p>
        </div>
      )}
    </div>
  );
}
