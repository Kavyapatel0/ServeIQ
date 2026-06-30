/**
 * Inventory Routes
 *
 * GET  /api/inventory/transactions   — inventory.view
 *                                       ?date= ?ingredient_id= ?supplier_id= ?transaction_type=
 * GET  /api/inventory/low-stock      — inventory.view
 * GET  /api/inventory/dashboard      — inventory.view
 * POST /api/inventory/adjust         — inventory.manage
 */

const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");

const InventoryController = require("../controllers/inventory.controller");
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

router.get(
  "/transactions",
  authenticate,
  authorize(PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  InventoryController.getTransactions
);

router.get(
  "/low-stock",
  authenticate,
  authorize(PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  InventoryController.getLowStock
);

router.get(
  "/dashboard",
  authenticate,
  authorize(PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  InventoryController.getDashboard
);

router.post(
  "/adjust",
  authenticate,
  authorize(PERMISSIONS.INVENTORY_MANAGE),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  validators.adjustStock,
  validate,
  InventoryController.adjustStock
);

module.exports = router;