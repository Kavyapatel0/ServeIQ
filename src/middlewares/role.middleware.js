/**
 * authorize(...allowedRoles)
 *
 * Usage:
 *   router.get("/users", authenticate, authorize("Super Admin"), handler)
 *   router.get("/orders", authenticate, authorize("Super Admin", "Branch Manager", "Cashier"), handler)
 *
 * Must be used AFTER the `authenticate` middleware.
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}. Your role: ${userRole}`,
      });
    }

    next();
  };
};

/**
 * Convenience role constants
 * Import these to keep route files readable and avoid typos.
 */
const ROLES = {
  SUPER_ADMIN: "Super Admin",
  BRANCH_MANAGER: "Branch Manager",
  CASHIER: "Cashier",
  CHEF: "Chef",
};

module.exports = { authorize, ROLES };