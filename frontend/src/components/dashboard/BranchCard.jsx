import { Building2 } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WidgetSkeleton } from "./WidgetSkeleton";

/**
 * Snapshot of the current branch, assembled client-side from three
 * widgets that are already on the page (tables, kitchen, inventory) —
 * there's no dedicated /api/branches endpoint yet, so this reuses
 * data already being fetched rather than adding a new call.
 */
export function BranchCard({ user, tables, tablesStatus, kitchen, inventory }) {
  const isLoading = tablesStatus === "loading" || tablesStatus === "idle";
  const branchName = tables?.[0]?.branch_name || (user?.branch_id ? `Branch #${user.branch_id}` : "All Branches");
  const availableTables = (tables || []).filter((t) => t.status === "AVAILABLE").length;
  const totalTables = (tables || []).length;

  const kitchenLoad = kitchen ? kitchen.pending + kitchen.preparing : null;
  const inventoryHealthy = inventory ? inventory.low_stock_count === 0 && inventory.out_of_stock_count === 0 : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branch Information</CardTitle>
        <CardDescription>Where you're currently working</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <WidgetSkeleton rows={4} className="h-8" />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{branchName}</p>
                <p className="text-xs text-text-secondary">{user?.role}</p>
              </div>
            </div>

            <dl className="space-y-2.5 border-t border-border pt-4 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-text-secondary">Active Tables</dt>
                <dd className="font-medium text-text-primary">
                  {availableTables} / {totalTables} available
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-text-secondary">Kitchen Load</dt>
                <dd>
                  {kitchenLoad === null ? (
                    <span className="text-text-secondary">—</span>
                  ) : (
                    <Badge variant={kitchenLoad > 5 ? "warning" : "success"}>{kitchenLoad} in queue</Badge>
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-text-secondary">Inventory Health</dt>
                <dd>
                  {inventoryHealthy === null ? (
                    <span className="text-text-secondary">—</span>
                  ) : (
                    <Badge variant={inventoryHealthy ? "success" : "danger"}>
                      {inventoryHealthy ? "Healthy" : "Needs attention"}
                    </Badge>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </CardContent>
    </Card>
  );
}