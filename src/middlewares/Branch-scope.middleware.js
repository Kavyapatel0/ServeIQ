/**
 * enforceBranchScope(bypassPermission)
 *
 * Generic branch-isolation guard. A user who holds `bypassPermission`
 * (e.g. a Super Admin with "users.manage") can see/act on any branch.
 * Everyone else is locked to their own `branch_id` — even if they pass
 * a different branch_id in the query string or body.
 *
 * This does NOT replace authorize() — it runs after it, and only
 * constrains *which branch's data* a request can touch.
 *
 * Usage:
 *   router.get(
 *     "/orders",
 *     authenticate,
 *     authorize(PERMISSIONS.ORDERS_VIEW),
 *     enforceBranchScope(PERMISSIONS.USERS_MANAGE), // Super Admin bypasses
 *     OrderController.getAll
 *   );
 *
 * In the controller, read the enforced value from req.branchScope
 * instead of trusting req.query.branch_id directly:
 *
 *   const branchFilter = req.branchScope; // null = no restriction (full access)
 */
const enforceBranchScope = (bypassPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const hasBypass = bypassPermission
      ? (req.user.permissions || []).includes(bypassPermission)
      : false;

    if (hasBypass) {
      // Full access — no branch restriction. Controller may still
      // honor an explicit ?branch_id= query param if provided.
      req.branchScope = null;
      return next();
    }

    if (!req.user.branch_id) {
      // User has no branch assigned and no bypass — nothing they're
      // allowed to see. Fail closed rather than leaking cross-branch data.
      return res.status(403).json({
        success: false,
        message: "Access denied. No branch assigned to this account.",
      });
    }

    // Lock every downstream query to the user's own branch,
    // regardless of what they passed in query/body.
    req.branchScope = req.user.branch_id;
    next();
  };
};

module.exports = { enforceBranchScope };