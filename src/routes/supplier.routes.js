/**
 * Supplier Routes
 *
 * GET    /api/suppliers                    — supplier.view
 * GET    /api/suppliers/:id                — supplier.view
 * POST   /api/suppliers                    — supplier.manage
 * PUT    /api/suppliers/:id                — supplier.manage
 * PATCH  /api/suppliers/:id/toggle-active   — supplier.manage
 * DELETE /api/suppliers/:id                — supplier.manage
 */

const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");

const SupplierController = require("../controllers/supplier.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize, PERMISSIONS } = require("../middlewares/role.middleware");
const validators = require("../middlewares/validators");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

router.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.SUPPLIER_VIEW, PERMISSIONS.SUPPLIER_MANAGE),
  SupplierController.getAll
);

router.get(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.SUPPLIER_VIEW, PERMISSIONS.SUPPLIER_MANAGE),
  SupplierController.getById
);

router.post(
  "/",
  authenticate,
  authorize(PERMISSIONS.SUPPLIER_MANAGE),
  validators.createSupplier,
  validate,
  SupplierController.create
);

router.put(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.SUPPLIER_MANAGE),
  validators.updateSupplier,
  validate,
  SupplierController.update
);

router.patch(
  "/:id/toggle-active",
  authenticate,
  authorize(PERMISSIONS.SUPPLIER_MANAGE),
  SupplierController.toggleActive
);

router.delete(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.SUPPLIER_MANAGE),
  SupplierController.delete
);

module.exports = router;