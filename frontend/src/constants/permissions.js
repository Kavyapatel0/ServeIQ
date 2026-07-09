/**
 * Permission key constants.
 *
 * These string values must stay byte-for-byte identical to the
 * `permission_key` values seeded in the backend's Permissions table
 * (see database/02_seed_data.sql and src/middlewares/role.middleware.js).
 * The JWT payload's `permissions` array is a list of these strings.
 */
export const PERMISSIONS = {
  USERS_MANAGE: "users.manage",
  USERS_VIEW: "users.view",
  ROLES_MANAGE: "roles.manage",
  BRANCHES_MANAGE: "branches.manage",

  ORDERS_CREATE: "orders.create",
  ORDERS_VIEW: "orders.view",
  ORDERS_UPDATE_STATUS: "orders.update_status",
  ORDERS_CANCEL: "orders.cancel",
  PAYMENTS_PROCESS: "payments.process",

  KITCHEN_VIEW: "kitchen.view",
  KITCHEN_UPDATE_STATUS: "kitchen.update_status",

  MENU_MANAGE: "menu.manage",

  INVENTORY_VIEW: "inventory.view",
  INVENTORY_MANAGE: "inventory.manage",

  SUPPLIER_VIEW: "supplier.view",
  SUPPLIER_MANAGE: "supplier.manage",
  PURCHASE_VIEW: "purchase.view",
  PURCHASE_MANAGE: "purchase.manage",

  CUSTOMERS_MANAGE: "customers.manage",
  LOYALTY_MANAGE: "loyalty.manage",
  COUPONS_MANAGE: "coupons.manage",
  CRM_VIEW: "crm.view",
  CRM_MANAGE: "crm.manage",

  ANALYTICS_VIEW: "analytics.view",

  TABLES_VIEW: "tables.view",
};

export const ROLES = {
  SUPER_ADMIN: "Super Admin",
  BRANCH_MANAGER: "Branch Manager",
  CASHIER: "Cashier",
  CHEF: "Chef",
  WAITER: "Waiter",
  INVENTORY_MANAGER: "Inventory Manager",
};
