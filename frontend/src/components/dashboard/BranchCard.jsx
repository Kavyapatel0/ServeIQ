import { Building2, Armchair, ChefHat, Package } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WidgetSkeleton } from "./WidgetSkeleton";

export function BranchCard({ user, tables, tablesStatus, kitchen, inventory }) {
  const isLoading     = tablesStatus === "loading" || tablesStatus === "idle";
  const branchName    = tables?.[0]?.branch_name || (user?.branch_id ? `Branch #${user.branch_id}` : "All Branches");
  const available     = (tables || []).filter((t) => t.status === "AVAILABLE").length;
  const totalTables   = (tables || []).length;
  const kitchenLoad   = kitchen ? kitchen.pending + kitchen.preparing : null;
  const invHealthy    = inventory
    ? Number(inventory.low_stock_count) === 0 && Number(inventory.out_of_stock_count) === 0
    : null;

  const metrics = [
    {
      icon: Armchair,
      label: "Tables Available",
      value: totalTables ? `${available} / ${totalTables}` : "—",
      status: available > 0 ? "success" : "warning",
    },
    {
      icon: ChefHat,
      label: "Kitchen Queue",
      value: kitchenLoad !== null ? `${kitchenLoad} orders` : "—",
      status: kitchenLoad > 5 ? "warning" : "success",
      badge: kitchenLoad !== null ? (kitchenLoad > 5 ? "Busy" : "Normal") : null,
    },
    {
      icon: Package,
      label: "Inventory",
      value: invHealthy === null ? "—" : invHealthy ? "All healthy" : "Needs attention",
      status: invHealthy === false ? "danger" : "success",
    },
  ];

  return (
    <Card className="hover:card-shadow-elevated transition-shadow duration-200">
      <CardHeader>
        <CardTitle>Branch Overview</CardTitle>
        <CardDescription>Current operational snapshot</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <WidgetSkeleton rows={4} className="h-8" />
        ) : (
          <div className="space-y-5">
            {/* Branch identity */}
            <div className="flex items-center gap-3 rounded-xl bg-warm-100 px-4 py-3 ring-1 ring-warm-200">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100">
                <Building2 className="h-5 w-5 text-primary-600" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">{branchName}</p>
                <p className="text-xs text-text-secondary">{user?.role} · Active now</p>
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-2.5">
              {metrics.map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
                >
                  <div className="flex items-center gap-2.5">
                    <m.icon className="h-4 w-4 text-text-secondary" strokeWidth={1.75} />
                    <span className="text-sm text-text-secondary">{m.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.badge && (
                      <Badge variant={m.status === "warning" ? "warning" : "success"} className="text-[10px]">
                        {m.badge}
                      </Badge>
                    )}
                    <span className="text-sm font-semibold text-text-primary">{m.value}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
