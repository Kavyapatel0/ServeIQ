const express = require("express");
const router = express.Router();

const CustomerController = require("../controllers/customer.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize, PERMISSIONS } = require("../middlewares/role.middleware");

router.use(authenticate);

// ─── Module 1: Customer Profiles ─────────────────────────────

/**
 * @openapi
 * /api/customers:
 *   get:
 *     summary: List customers (search by name/phone/email)
 *     tags: [CRM - Customers]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: is_active
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: Customer list }
 */
router.get(
  "/",
  authorize(PERMISSIONS.CUSTOMERS_MANAGE, PERMISSIONS.CRM_VIEW),
  CustomerController.getAll
);

/**
 * @openapi
 * /api/customers/{id}:
 *   get:
 *     summary: Get a single customer profile
 *     tags: [CRM - Customers]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Customer found }
 *       404: { description: Not found }
 */
router.get(
  "/:id",
  authorize(PERMISSIONS.CUSTOMERS_MANAGE, PERMISSIONS.CRM_VIEW),
  CustomerController.getById
);

/**
 * @openapi
 * /api/customers:
 *   post:
 *     summary: Create a new customer profile
 *     tags: [CRM - Customers]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               date_of_birth: { type: string, format: date }
 *               gender: { type: string, enum: [MALE, FEMALE, OTHER] }
 *               address: { type: string }
 *     responses:
 *       201: { description: Customer created }
 *       409: { description: Phone or email already registered }
 */
router.post(
  "/",
  authorize(PERMISSIONS.CUSTOMERS_MANAGE),
  CustomerController.create
);

/**
 * @openapi
 * /api/customers/{id}:
 *   put:
 *     summary: Update customer profile
 *     tags: [CRM - Customers]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated }
 *       404: { description: Not found }
 */
router.put(
  "/:id",
  authorize(PERMISSIONS.CUSTOMERS_MANAGE),
  CustomerController.update
);

/**
 * @openapi
 * /api/customers/{id}:
 *   delete:
 *     summary: Deactivate a customer (soft delete)
 *     tags: [CRM - Customers]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Deactivated }
 *       404: { description: Not found }
 */
router.delete(
  "/:id",
  authorize(PERMISSIONS.CUSTOMERS_MANAGE, PERMISSIONS.CRM_MANAGE),
  CustomerController.remove
);

// ─── Module 2: Visit History ──────────────────────────────────

/**
 * @openapi
 * /api/customers/{id}/history:
 *   get:
 *     summary: Get a customer's visit history (from Orders + Payments)
 *     tags: [CRM - Customers]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Visit history with order and payment details }
 */
router.get(
  "/:id/history",
  authorize(PERMISSIONS.CUSTOMERS_MANAGE, PERMISSIONS.CRM_VIEW, PERMISSIONS.CRM_MANAGE),
  CustomerController.getHistory
);

// ─── Module 3: Loyalty ───────────────────────────────────────

/**
 * @openapi
 * /api/customers/{id}/loyalty:
 *   get:
 *     summary: Get loyalty summary (current, lifetime earned, redeemed)
 *     tags: [CRM - Loyalty]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Loyalty summary and transaction history }
 */
router.get(
  "/:id/loyalty",
  authorize(PERMISSIONS.LOYALTY_MANAGE, PERMISSIONS.CRM_VIEW, PERMISSIONS.CRM_MANAGE),
  CustomerController.getLoyalty
);

/**
 * @openapi
 * /api/customers/{id}/loyalty/redeem:
 *   post:
 *     summary: Redeem loyalty points for a customer
 *     tags: [CRM - Loyalty]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [points]
 *             properties:
 *               points: { type: integer }
 *     responses:
 *       200: { description: Points redeemed }
 *       400: { description: Insufficient points }
 */
router.post(
  "/:id/loyalty/redeem",
  authorize(PERMISSIONS.LOYALTY_MANAGE),
  CustomerController.redeemPoints
);

module.exports = router;