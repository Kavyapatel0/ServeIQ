/**
 * Purchase Order Routes
 *
 * POST   /api/purchase-orders                      — purchase.manage
 * GET    /api/purchase-orders                       — purchase.view
 * GET    /api/purchase-orders/:id                   — purchase.view
 * POST   /api/purchase-orders/:id/items             — purchase.manage
 * PATCH  /api/purchase-orders/:id/items/:itemId     — purchase.manage
 * DELETE /api/purchase-orders/:id/items/:itemId     — purchase.manage
 * PATCH  /api/purchase-orders/:id/receive           — purchase.manage
 * PATCH  /api/purchase-orders/:id/cancel            — purchase.manage
 */

const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");

const PurchaseController = require("../controllers/purchase.controller");
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

router.post(
  "/",
  authenticate,
  authorize(PERMISSIONS.PURCHASE_MANAGE),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  validators.createPurchaseOrder,
  validate,
  PurchaseController.create
);

router.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.PURCHASE_VIEW, PERMISSIONS.PURCHASE_MANAGE),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  PurchaseController.getAll
);

router.get(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.PURCHASE_VIEW, PERMISSIONS.PURCHASE_MANAGE),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  PurchaseController.getById
);

router.post(
  "/:id/items",
  authenticate,
  authorize(PERMISSIONS.PURCHASE_MANAGE),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  validators.addPurchaseOrderItem,
  validate,
  PurchaseController.addItem
);

router.patch(
  "/:id/items/:itemId",
  authenticate,
  authorize(PERMISSIONS.PURCHASE_MANAGE),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  validators.updatePurchaseOrderItem,
  validate,
  PurchaseController.updateItem
);

router.delete(
  "/:id/items/:itemId",
  authenticate,
  authorize(PERMISSIONS.PURCHASE_MANAGE),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  PurchaseController.removeItem
);

// PATCH instead of POST to match frontend inventoryApi.js
router.patch(
  "/:id/receive",
  authenticate,
  authorize(PERMISSIONS.PURCHASE_MANAGE),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  PurchaseController.receive
);

// Cancel a PENDING purchase order
router.patch(
  "/:id/cancel",
  authenticate,
  authorize(PERMISSIONS.PURCHASE_MANAGE),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  PurchaseController.cancel
);

module.exports = router;