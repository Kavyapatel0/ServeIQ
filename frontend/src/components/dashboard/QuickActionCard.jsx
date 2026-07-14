import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UtensilsCrossed, ChefHat, Boxes, Users, BarChart3, ArrowRight } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

const ACTIONS = [
  {
    label: "New Order",
    description: "Open POS",
    icon: UtensilsCrossed,
    path: ROUTES.POS,
    permission: PERMISSIONS.ORDERS_CREATE,
    accent: "primary",
  },
  {
    label: "Kitchen",
    description: "View queue",
    icon: ChefHat,
    path: ROUTES.KITCHEN,
    permission: PERMISSIONS.KITCHEN_VIEW,
    accent: "warning",
  },
  {
    label: "Inventory",
    description: "Stock levels",
    icon: Boxes,
    path: ROUTES.INVENTORY,
    permission: PERMISSIONS.INVENTORY_VIEW,
    accent: "info",
  },
  {
    label: "Customers",
    description: "CRM & loyalty",
    icon: Users,
    path: ROUTES.CRM,
    permission: PERMISSIONS.CRM_VIEW,
    accent: "success",
  },
  {
    label: "Analytics",
    description: "BI reports",
    icon: BarChart3,
    path: ROUTES.ANALYTICS,
    permission: PERMISSIONS.ANALYTICS_VIEW,
    accent: "accent",
  },
];

const ACCENT_STYLES = {
  primary: { icon: "bg-primary-100 text-primary-600", hover: "hover:border-primary-300 hover:bg-primary-50" },
  warning: { icon: "bg-warning-bg text-warning",       hover: "hover:border-yellow-300 hover:bg-warning-bg" },
  info:    { icon: "bg-info-bg text-info",             hover: "hover:border-blue-300 hover:bg-info-bg" },
  success: { icon: "bg-success-bg text-success",       hover: "hover:border-green-300 hover:bg-success-bg" },
  accent:  { icon: "bg-accent-100 text-accent-600",   hover: "hover:border-accent-300 hover:bg-accent-50" },
};

export function QuickActionCard() {
  const navigate = useNavigate();
  const { can }  = usePermission();
  const visible  = ACTIONS.filter((a) => can(a.permission));

  if (visible.length === 0) return null;

  return (
    <Card className="hover:card-shadow-elevated transition-shadow duration-200">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Jump straight to the module you need</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {visible.map((action, i) => {
            const style = ACCENT_STYLES[action.accent];
            return (
              <motion.button
                key={action.label}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(action.path)}
                className={cn(
                  "group flex flex-col items-center gap-2.5 rounded-xl border border-border bg-warm-50",
                  "px-3 py-5 text-center transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                  style.hover
                )}
              >
                <span className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-150 group-hover:scale-105",
                  style.icon
                )}>
                  <action.icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-xs font-bold text-text-primary">{action.label}</p>
                  <p className="text-[10px] text-text-secondary">{action.description}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
