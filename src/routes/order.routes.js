/**
 * Order Routes
 *
 * POST   /api/orders                      — Create order     (orders.create)
 * GET    /api/orders                      — List orders      (orders.view)
 * GET    /api/orders/:id                  — Get order        (orders.view)
 * POST   /api/orders/:id/items            — Add item         (orders.create)
 * GET    /api/orders/:id/items            — Get items        (orders.view)
 * DELETE /api/orders/:id/items/:itemId    — Remove item      (orders.create)
 * POST   /api/orders/:id/send-to-kitchen  — Send to kitchen  (orders.create)
 * PATCH  /api/orders/:id/status           — Update status    (orders.update_status)
 * POST   /api/orders/:id/cancel           — Cancel order     (orders.cancel)
 * GET    /api/orders/:id/receipt          — Get receipt      (orders.view)
 */

const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");

const OrderController = require("../controllers/order.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize, PERMISSIONS } = require("../middlewares/role.middleware");
const { enforceBranchScope } = require("../middlewares/Branch-scope.middleware");
const validators = require("../middlewares/validators");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Create order
router.post(
  "/",
  authenticate,
  authorize(PERMISSIONS.ORDERS_CREATE),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  validators.createOrder,
  validate,
  OrderController.create
);

// List all orders
router.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.ORDERS_VIEW),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  OrderController.getAll
);

// Get single order
router.get(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.ORDERS_VIEW),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  OrderController.getById
);

// Add item to order
router.post(
  "/:id/items",
  authenticate,
  authorize(PERMISSIONS.ORDERS_CREATE),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  validators.addOrderItem,
  validate,
  OrderController.addItem
);

// Get items of order
router.get(
  "/:id/items",
  authenticate,
  authorize(PERMISSIONS.ORDERS_VIEW),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  OrderController.getItems
);

// Remove item from order
router.delete(
  "/:id/items/:itemId",
  authenticate,
  authorize(PERMISSIONS.ORDERS_CREATE),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  OrderController.removeItem
);

// Send order to kitchen
router.post(
  "/:id/send-to-kitchen",
  authenticate,
  authorize(PERMISSIONS.ORDERS_CREATE),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  OrderController.sendToKitchen
);

// Update order status (manager)
router.patch(
  "/:id/status",
  authenticate,
  authorize(PERMISSIONS.ORDERS_UPDATE_STATUS),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  validators.updateOrderStatus,
  validate,
  OrderController.updateStatus
);

// Cancel order
router.post(
  "/:id/cancel",
  authenticate,
  authorize(PERMISSIONS.ORDERS_CANCEL),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  OrderController.cancel
);

// Get receipt
router.get(
  "/:id/receipt",
  authenticate,
  authorize(PERMISSIONS.ORDERS_VIEW),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  OrderController.getReceipt
);

module.exports = router;