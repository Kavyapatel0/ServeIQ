import {
  LayoutDashboard,
  UtensilsCrossed,
  ChefHat,
  Boxes,
  Users,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

import { ROUTES } from "./routes";
import { PERMISSIONS } from "./permissions";

/**
 * Sidebar navigation registry.
 *
 * `permission: null` means every authenticated user can see the item
 * regardless of role (e.g. Dashboard). Anything else is checked against
 * the current user's permissions array before rendering — this is how
 * the sidebar naturally reconfigures itself per role without any
 * role-name branching in component code.
 */
export const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    permission: null,
  },
  {
    label: "POS",
    path: ROUTES.POS,
    icon: UtensilsCrossed,
    permission: PERMISSIONS.ORDERS_VIEW,
  },
  {
    label: "Kitchen",
    path: ROUTES.KITCHEN,
    icon: ChefHat,
    permission: PERMISSIONS.KITCHEN_VIEW,
  },
  {
    label: "Inventory",
    path: ROUTES.INVENTORY,
    icon: Boxes,
    permission: PERMISSIONS.INVENTORY_VIEW,
  },
  {
    label: "CRM",
    path: ROUTES.CRM,
    icon: Users,
    permission: PERMISSIONS.CRM_VIEW,
  },
  {
    label: "Analytics",
    path: ROUTES.ANALYTICS,
    icon: BarChart3,
    permission: PERMISSIONS.ANALYTICS_VIEW,
  },
  {
    label: "Administration",
    path: ROUTES.ADMIN,
    icon: ShieldCheck,
    permission: PERMISSIONS.USERS_VIEW,
  },
];
