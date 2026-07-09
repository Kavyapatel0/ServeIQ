/**
 * Analytics Routes — Phase 6
 *
 * All routes:
 *   - require authentication (authenticate middleware)
 *   - require analytics.view permission
 *   - are branch-scoped via enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE)
 *     → Super Admin: req.branchScope = null (can pass ?branch_id= to filter)
 *     → Branch Manager: req.branchScope = their branch_id (locked)
 *
 * Module 1 — Sales Analytics
 *   GET /api/analytics/revenue            ?period=today|week|month|year
 *   GET /api/analytics/sales              Summary: counts, avg bill, high/low
 *   GET /api/analytics/sales/daily        ?days=30
 *   GET /api/analytics/sales/monthly      ?months=12
 *
 * Module 2 — Business Analytics
 *   GET /api/analytics/peak-hours         Orders by hour of day
 *   GET /api/analytics/top-items          ?limit=10
 *   GET /api/analytics/payment-methods    Count + % + revenue per method
 *
 * Module 3 — Customer Analytics
 *   GET /api/analytics/customers          Total, active, returning, avg visits
 *   GET /api/analytics/loyalty            Points earned/redeemed/outstanding
 *
 * Module 4 — Inventory Analytics
 *   GET /api/analytics/stock              Good/low/out-of-stock breakdown
 *   GET /api/analytics/purchases          Spend by supplier, recent POs
 */

const express = require("express");
const router = express.Router();

const AnalyticsController = require("../controllers/analytics.controller");
const { authenticate }    = require("../middlewares/auth.middleware");
const { authorize, PERMISSIONS } = require("../middlewares/role.middleware");
const { enforceBranchScope }     = require("../middlewares/Branch-scope.middleware");

// Both middlewares applied to the entire router
router.use(authenticate);
router.use(authorize(PERMISSIONS.ANALYTICS_VIEW));
router.use(enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE));

// ─── Module 1: Sales Analytics ───────────────────────────────

/**
 * @openapi
 * /api/analytics/revenue:
 *   get:
 *     summary: Revenue report with period-over-period comparison
 *     tags: [Analytics - Sales]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema: { type: string, enum: [today, week, month, year] }
 *         description: Defaults to "today"
 *       - in: query
 *         name: branch_id
 *         schema: { type: integer }
 *         description: Super Admin only — filter to a specific branch
 *     responses:
 *       200:
 *         description: Revenue data with comparison to previous period
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden — analytics.view required }
 */
router.get("/revenue", AnalyticsController.getRevenue);

/**
 * @openapi
 * /api/analytics/sales:
 *   get:
 *     summary: Sales summary — order counts, avg/high/low bill
 *     tags: [Analytics - Sales]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Sales summary stats }
 */
router.get("/sales", AnalyticsController.getSalesSummary);

/**
 * @openapi
 * /api/analytics/sales/daily:
 *   get:
 *     summary: Daily sales for the last N days (default 30, max 365)
 *     tags: [Analytics - Sales]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer, default: 30 }
 *     responses:
 *       200: { description: Array of date + revenue + order_count }
 */
router.get("/sales/daily", AnalyticsController.getDailySales);

/**
 * @openapi
 * /api/analytics/sales/monthly:
 *   get:
 *     summary: Monthly sales for the last N months (default 12, max 36)
 *     tags: [Analytics - Sales]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: months
 *         schema: { type: integer, default: 12 }
 *     responses:
 *       200: { description: Array of year + month + revenue + order_count }
 */
router.get("/sales/monthly", AnalyticsController.getMonthlySales);

// ─── Module 2: Business Analytics ────────────────────────────

/**
 * @openapi
 * /api/analytics/peak-hours:
 *   get:
 *     summary: Restaurant busiest hours — orders and revenue by hour of day
 *     tags: [Analytics - Business]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Array of hour (0-23), hour_label, order_count, revenue }
 */
router.get("/peak-hours", AnalyticsController.getPeakHours);

/**
 * @openapi
 * /api/analytics/top-items:
 *   get:
 *     summary: Top selling menu items by total quantity sold
 *     tags: [Analytics - Business]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: Ranked list of menu items with quantity and revenue }
 */
router.get("/top-items", AnalyticsController.getTopItems);

/**
 * @openapi
 * /api/analytics/payment-methods:
 *   get:
 *     summary: Payment method breakdown — count, percentage, revenue per method
 *     tags: [Analytics - Business]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Array of payment_method, count, percentage, revenue }
 */
router.get("/payment-methods", AnalyticsController.getPaymentMethods);

// ─── Module 3: Customer Analytics ────────────────────────────

/**
 * @openapi
 * /api/analytics/customers:
 *   get:
 *     summary: Customer analytics — total, active, returning, avg visits, top spenders
 *     tags: [Analytics - Customer]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Customer overview with top 10 spenders }
 */
router.get("/customers", AnalyticsController.getCustomerAnalytics);

/**
 * @openapi
 * /api/analytics/loyalty:
 *   get:
 *     summary: Loyalty program performance — earned, redeemed, outstanding points
 *     tags: [Analytics - Customer]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Loyalty summary with top 10 earners }
 */
router.get("/loyalty", AnalyticsController.getLoyaltyAnalytics);

// ─── Module 4: Inventory Analytics ───────────────────────────

/**
 * @openapi
 * /api/analytics/stock:
 *   get:
 *     summary: Stock report — good/low/out-of-stock breakdown per ingredient
 *     tags: [Analytics - Inventory]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Summary counts + per-ingredient status list }
 */
router.get("/stock", AnalyticsController.getStockReport);

/**
 * @openapi
 * /api/analytics/purchases:
 *   get:
 *     summary: Purchase report — spend by supplier, recent purchase orders
 *     tags: [Analytics - Inventory]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Supplier spend breakdown + recent PO list }
 */
router.get("/purchases", AnalyticsController.getPurchaseReport);

module.exports = router;