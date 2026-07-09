import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * ServeIQ wordmark. `variant="dark"` is used on the navy sidebar,
 * `variant="light"` on white surfaces like the login card.
 */
export function Logo({ variant = "light", collapsed = false, className }) {
  const isDark = variant === "dark";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500">
        <UtensilsCrossed className="h-[18px] w-[18px] text-white" strokeWidth={2.25} />
      </div>
      {!collapsed && (
        <div className="leading-tight">
          <p className={cn("text-base font-bold tracking-tight", isDark ? "text-white" : "text-text-primary")}>
            ServeIQ
          </p>
          <p className={cn("text-[11px] font-medium", isDark ? "text-navy-400" : "text-text-secondary")}>
            Restaurant BI Platform
          </p>
        </div>
      )}
    </div>
  );
}
