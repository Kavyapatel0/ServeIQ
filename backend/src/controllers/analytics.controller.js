const AnalyticsService = require("../services/analytics.service");

/**
 * Analytics Controller
 *
 * Branch isolation is handled by the enforceBranchScope middleware
 * (applied in analytics.routes.js) before every handler here.
 *
 * req.branchScope:
 *   null         → Super Admin, no branch filter, can pass ?branch_id= to drill in
 *   <number>     → Branch Manager locked to their own branch
 *
 * Every handler reads req.branchScope and optionally honours ?branch_id=
 * from the query string (only when branchScope is null, i.e. Super Admin).
 */

const buildParams = (req) => ({
  branch_id: req.branchScope !== null
    ? req.branchScope
    : (req.query.branch_id ? Number(req.query.branch_id) : null),
  ...req.query,
});

const AnalyticsController = {

  // ─── Module 1: Sales Analytics ──────────────────────────────

  /**
   * GET /api/analytics/revenue?period=today|week|month|year
   */
  async getRevenue(req, res) {
    try {
      const data = await AnalyticsService.getRevenue(buildParams(req));
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  /**
   * GET /api/analytics/sales
   */
  async getSalesSummary(req, res) {
    try {
      const data = await AnalyticsService.getSalesSummary(buildParams(req));
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  /**
   * GET /api/analytics/sales/daily?days=30
   */
  async getDailySales(req, res) {
    try {
      const data = await AnalyticsService.getDailySales(buildParams(req));
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  /**
   * GET /api/analytics/sales/monthly?months=12
   */
  async getMonthlySales(req, res) {
    try {
      const data = await AnalyticsService.getMonthlySales(buildParams(req));
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // ─── Module 2: Business Analytics ───────────────────────────

  /**
   * GET /api/analytics/peak-hours
   */
  async getPeakHours(req, res) {
    try {
      const data = await AnalyticsService.getPeakHours(buildParams(req));
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  /**
   * GET /api/analytics/top-items?limit=10
   */
  async getTopItems(req, res) {
    try {
      const data = await AnalyticsService.getTopItems(buildParams(req));
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  /**
   * GET /api/analytics/payment-methods
   */
  async getPaymentMethods(req, res) {
    try {
      const data = await AnalyticsService.getPaymentMethods(buildParams(req));
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // ─── Module 3: Customer Analytics ───────────────────────────

  /**
   * GET /api/analytics/customers
   */
  async getCustomerAnalytics(req, res) {
    try {
      const data = await AnalyticsService.getCustomerAnalytics(buildParams(req));
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  /**
   * GET /api/analytics/loyalty
   */
  async getLoyaltyAnalytics(req, res) {
    try {
      const data = await AnalyticsService.getLoyaltyAnalytics(buildParams(req));
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // ─── Module 4: Inventory Analytics ──────────────────────────

  /**
   * GET /api/analytics/stock
   */
  async getStockReport(req, res) {
    try {
      const data = await AnalyticsService.getStockReport(buildParams(req));
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  /**
   * GET /api/analytics/purchases
   */
  async getPurchaseReport(req, res) {
    try {
      const data = await AnalyticsService.getPurchaseReport(buildParams(req));
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },
};

module.exports = AnalyticsController;