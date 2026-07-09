/**
 * Central route path registry.
 * Every <Link>, navigate(), and route definition should import from
 * here rather than hardcoding strings, so a path only ever changes
 * in one place.
 */
export const ROUTES = {
  LOGIN: "/login",

  DASHBOARD: "/",

  POS: "/pos",
  POS_NEW_ORDER: "/pos/new",

  KITCHEN: "/kitchen",

  INVENTORY: "/inventory",
  INVENTORY_INGREDIENTS: "/inventory/ingredients",
  INVENTORY_SUPPLIERS: "/inventory/suppliers",
  INVENTORY_PURCHASE_ORDERS: "/inventory/purchase-orders",

  CRM: "/crm",
  CRM_CUSTOMERS: "/crm/customers",
  CRM_COUPONS: "/crm/coupons",

  ANALYTICS: "/analytics",

  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_ROLES: "/admin/roles",
  ADMIN_BRANCHES: "/admin/branches",
  ADMIN_AUDIT_LOGS: "/admin/audit-logs",

  PROFILE: "/profile",
  SETTINGS: "/settings",

  FORBIDDEN: "/403",
  NOT_FOUND: "/404",
};
