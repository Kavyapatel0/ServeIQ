import { useNavigate } from "react-router-dom";
import { UtensilsCrossed, ChefHat, Boxes, Users, BarChart3 } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";

const ACTIONS = [
  { label: "Create Order", icon: UtensilsCrossed, path: ROUTES.POS, permission: PERMISSIONS.ORDERS_CREATE },
  { label: "Kitchen", icon: ChefHat, path: ROUTES.KITCHEN, permission: PERMISSIONS.KITCHEN_VIEW },
  { label: "Inventory", icon: Boxes, path: ROUTES.INVENTORY, permission: PERMISSIONS.INVENTORY_VIEW },
  { label: "Customers", icon: Users, path: ROUTES.CRM, permission: PERMISSIONS.CRM_VIEW },
  { label: "Analytics", icon: BarChart3, path: ROUTES.ANALYTICS, permission: PERMISSIONS.ANALYTICS_VIEW },
];

/** One-click shortcuts to the modules the current role can access. */
export function QuickActionCard() {
  const navigate = useNavigate();
  const { can } = usePermission();
  const visible = ACTIONS.filter((action) => can(action.permission));

  if (visible.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Jump straight to what you need</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {visible.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-app-bg px-3 py-4 text-center transition-colors hover:border-brand-300 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-card text-brand-600 card-shadow">
                <action.icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-medium text-text-primary">{action.label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}