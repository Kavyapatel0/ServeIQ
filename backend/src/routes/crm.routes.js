const express = require("express");
const router = express.Router();

const CRMController = require("../controllers/crm.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize, PERMISSIONS } = require("../middlewares/role.middleware");

router.use(authenticate);

/**
 * @openapi
 * /api/crm/dashboard:
 *   get:
 *     summary: CRM Dashboard — aggregate customer stats for managers
 *     description: |
 *       Returns: total customers, new this month, returning customers,
 *       loyalty members, average spend per customer, top 10 spenders.
 *       No AI — pure SQL aggregates.
 *     tags: [CRM - Dashboard]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_customers: { type: integer }
 *                 new_this_month: { type: integer }
 *                 returning_customers: { type: integer }
 *                 loyalty_members: { type: integer }
 *                 average_spend_per_customer: { type: number }
 *                 top_customers: { type: array }
 */
router.get(
  "/dashboard",
  authorize(PERMISSIONS.CRM_MANAGE, PERMISSIONS.CRM_VIEW),
  CRMController.getDashboard
);

module.exports = router;