const express = require("express");
const router = express.Router();

const CouponController = require("../controllers/coupon.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize, PERMISSIONS } = require("../middlewares/role.middleware");

router.use(authenticate);

/**
 * @openapi
 * /api/coupons:
 *   get:
 *     summary: List all coupons
 *     tags: [CRM - Coupons]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: is_active
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: Coupon list with usage count }
 */
router.get(
  "/",
  authorize(PERMISSIONS.COUPONS_MANAGE, PERMISSIONS.CRM_VIEW, PERMISSIONS.CRM_MANAGE),
  CouponController.getAll
);

router.get(
  "/:id",
  authorize(PERMISSIONS.COUPONS_MANAGE, PERMISSIONS.CRM_VIEW, PERMISSIONS.CRM_MANAGE),
  CouponController.getById
);

/**
 * @openapi
 * /api/coupons:
 *   post:
 *     summary: Create a new coupon (Manager/Admin only)
 *     tags: [CRM - Coupons]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, discount, discount_type]
 *             properties:
 *               code: { type: string }
 *               discount: { type: number }
 *               discount_type: { type: string, enum: [PERCENTAGE, FIXED] }
 *               valid_from: { type: string, format: date }
 *               valid_to: { type: string, format: date }
 *               minimum_order_amount: { type: number }
 *               max_usage: { type: integer }
 *     responses:
 *       201: { description: Coupon created }
 *       409: { description: Code already exists }
 */
router.post(
  "/",
  authorize(PERMISSIONS.COUPONS_MANAGE, PERMISSIONS.CRM_MANAGE),
  CouponController.create
);

router.put(
  "/:id",
  authorize(PERMISSIONS.COUPONS_MANAGE, PERMISSIONS.CRM_MANAGE),
  CouponController.update
);

/**
 * @openapi
 * /api/coupons/{id}/toggle:
 *   patch:
 *     summary: Enable or disable a coupon
 *     tags: [CRM - Coupons]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [is_active]
 *             properties:
 *               is_active: { type: boolean }
 *     responses:
 *       200: { description: Coupon status toggled }
 */
router.patch(
  "/:id/toggle",
  authorize(PERMISSIONS.COUPONS_MANAGE, PERMISSIONS.CRM_MANAGE),
  CouponController.toggleActive
);

router.delete(
  "/:id",
  authorize(PERMISSIONS.COUPONS_MANAGE, PERMISSIONS.CRM_MANAGE),
  CouponController.remove
);

/**
 * @openapi
 * /api/coupons/validate:
 *   post:
 *     summary: Validate a coupon code (POS preview — no order required)
 *     tags: [CRM - Coupons]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code: { type: string }
 *               order_total: { type: number }
 *     responses:
 *       200: { description: Coupon valid, discount_amount returned }
 *       400: { description: Coupon invalid/expired/not met minimum }
 *       404: { description: Coupon not found }
 */
router.post(
  "/validate",
  authorize(PERMISSIONS.COUPONS_MANAGE, PERMISSIONS.PAYMENTS_PROCESS, PERMISSIONS.ORDERS_CREATE),
  CouponController.validate
);

/**
 * @openapi
 * /api/coupons/redeem:
 *   post:
 *     summary: Apply a coupon to an order at checkout
 *     tags: [CRM - Coupons]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [coupon_code, customer_id, order_id]
 *             properties:
 *               coupon_code: { type: string }
 *               customer_id: { type: integer }
 *               order_id: { type: integer }
 *     responses:
 *       200: { description: Coupon applied, discount amount and new grand total returned }
 *       400: { description: Coupon invalid, expired, or already used }
 *       404: { description: Coupon not found }
 */
router.post(
  "/redeem",
  authorize(PERMISSIONS.COUPONS_MANAGE, PERMISSIONS.PAYMENTS_PROCESS),
  CouponController.redeem
);

module.exports = router;