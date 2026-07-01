/**
 * Kitchen Routes
 *
 * GET   /api/kitchen/orders                — kitchen.view
 *                                             ?status=PENDING|PREPARING|READY|SERVED
 *                                             ?search=ORD-2026  ?sort=oldest|newest
 *                                             ?date=2026-07-01
 * GET   /api/kitchen/orders/:id             — kitchen.view
 * PATCH /api/kitchen/orders/:id/preparing   — kitchen.update_status (Chef)
 * PATCH /api/kitchen/orders/:id/ready       — kitchen.update_status (Chef)
 * PATCH /api/kitchen/orders/:id/served      — kitchen.view (Waiter marks served)
 * GET   /api/kitchen/dashboard              — kitchen.view
 *
 * RBAC summary (from spec):
 *   Waiter           — kitchen.view  (see READY orders to serve them)
 *   Chef             — kitchen.view + kitchen.update_status
 *   Kitchen Manager  — kitchen.view + kitchen.update_status (future role)
 *   Branch Manager   — kitchen.view + kitchen.update_status
 *   Super Admin      — everything
 */

const express = require("express");
const router = express.Router();

const KitchenController = require("../controllers/kitchen.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize, PERMISSIONS } = require("../middlewares/role.middleware");
const { enforceBranchScope } = require("../middlewares/Branch-scope.middleware");

// Dashboard — all kitchen.view roles
router.get(
  "/dashboard",
  authenticate,
  authorize(PERMISSIONS.KITCHEN_VIEW, PERMISSIONS.KITCHEN_UPDATE_STATUS),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  KitchenController.getDashboard
);

// Kitchen queue — list all orders
router.get(
  "/orders",
  authenticate,
  authorize(PERMISSIONS.KITCHEN_VIEW, PERMISSIONS.KITCHEN_UPDATE_STATUS),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  KitchenController.getAll
);

// Single kitchen order + items
router.get(
  "/orders/:id",
  authenticate,
  authorize(PERMISSIONS.KITCHEN_VIEW, PERMISSIONS.KITCHEN_UPDATE_STATUS),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  KitchenController.getById
);

// Chef starts cooking: PENDING → PREPARING
router.patch(
  "/orders/:id/preparing",
  authenticate,
  authorize(PERMISSIONS.KITCHEN_UPDATE_STATUS),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  KitchenController.markPreparing
);

// Chef finishes cooking: PREPARING → READY
router.patch(
  "/orders/:id/ready",
  authenticate,
  authorize(PERMISSIONS.KITCHEN_UPDATE_STATUS),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  KitchenController.markReady
);

// Waiter serves food: READY → SERVED
// kitchen.view is enough — waiter has this permission
router.patch(
  "/orders/:id/served",
  authenticate,
  authorize(PERMISSIONS.KITCHEN_VIEW, PERMISSIONS.KITCHEN_UPDATE_STATUS),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  KitchenController.markServed
);

module.exports = router;