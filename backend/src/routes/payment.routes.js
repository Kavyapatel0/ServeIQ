/**
 * Payment Routes
 *
 * POST   /api/payments                    — Process payment   (payments.process)
 * GET    /api/payments/order/:orderId     — Get payments for order (orders.view)
 */

const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");

const PaymentController = require("../controllers/payment.controller");
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
  authorize(PERMISSIONS.PAYMENTS_PROCESS),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  validators.processPayment,
  validate,
  PaymentController.process
);

router.get(
  "/order/:orderId",
  authenticate,
  authorize(PERMISSIONS.ORDERS_VIEW),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  PaymentController.getByOrder
);

module.exports = router;