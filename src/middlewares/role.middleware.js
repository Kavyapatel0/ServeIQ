/**
 * authorize(...requiredPermissions)
 *
 * Checks req.user.permissions (a flat array of permission_keys,
 * attached by `authenticate`) against the keys required for this route.
 *
 * Usage:
 *   router.post("/orders", authenticate, authorize("orders.create"), handler)
 *
 *   // Require ANY of multiple permissions (OR logic — default):
 *   router.get("/orders", authenticate, authorize("orders.view", "kitchen.view"), handler)
 *
 *   // Require ALL permissions (AND logic):
 *   router.delete("/orders/:id", authenticate, authorize.all("orders.cancel", "orders.view"), handler)
 *
 * Must be used AFTER the `authenticate` middleware.
 */
const authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const userPermissions = req.user.permissions || [];
    const hasAccess = requiredPermissions.some((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${requiredPermissions.join(" or ")}.`,
      });
    }

    next();
  };
};

/**
 * authorize.all(...requiredPermissions)
 * Same as authorize(), but requires ALL listed permissions (AND logic)
 * instead of any single one (OR logic).
 */
authorize.all = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const userPermissions = req.user.permissions || [];
    const hasAll = requiredPermissions.every((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasAll) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permissions: ${requiredPermissions.join(" and ")}.`,
      });
    }

    next();
  };
};

/**
 * Convenience permission-key constants.
 * Import these to avoid typos in route files, e.g.:
 *   authorize(PERMISSIONS.ORDERS_CREATE)
 */
const PERMISSIONS = {
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
  SUPPLIERS_MANAGE: "suppliers.manage",

  CUSTOMERS_MANAGE: "customers.manage",
  LOYALTY_MANAGE: "loyalty.manage",
  COUPONS_MANAGE: "coupons.manage",

  ANALYTICS_VIEW: "analytics.view",
};

/**
 * Role name constants — still useful for display purposes
 * or rare role-specific checks, but routes should prefer
 * permission-based authorize() over these.
 */
const ROLES = {
  SUPER_ADMIN: "Super Admin",
  BRANCH_MANAGER: "Branch Manager",
  CASHIER: "Cashier",
  CHEF: "Chef",
  WAITER: "Waiter",
};

module.exports = { authorize, PERMISSIONS, ROLES };