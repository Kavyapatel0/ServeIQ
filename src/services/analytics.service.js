const AnalyticsModel = require("../models/analytics.model");

/**
 * Analytics Service
 *
 * Sits between the controller (HTTP layer) and the model (SQL layer).
 * Handles parameter normalisation, default values, and any cross-query
 * composition that would otherwise clutter the controller.
 *
 * Analytics is read-only — no DB writes happen anywhere in this service.
 */
const AnalyticsService = {

  // ─── Module 1: Sales ────────────────────────────────────────

  async getRevenue(params) {
    const VALID_PERIODS = ["today", "week", "month", "year"];
    const period = VALID_PERIODS.includes(params.period) ? params.period : "today";
    return AnalyticsModel.getRevenue({ period, branch_id: params.branch_id });
  },

  async getSalesSummary(params) {
    return AnalyticsModel.getSalesSummary({ branch_id: params.branch_id });
  },

  async getDailySales(params) {
    const days = Math.min(Math.max(Number(params.days) || 30, 1), 365);
    return AnalyticsModel.getDailySales({ branch_id: params.branch_id, days });
  },

  async getMonthlySales(params) {
    const months = Math.min(Math.max(Number(params.months) || 12, 1), 36);
    return AnalyticsModel.getMonthlySales({ branch_id: params.branch_id, months });
  },

  // ─── Module 2: Business ─────────────────────────────────────

  async getPeakHours(params) {
    return AnalyticsModel.getPeakHours({ branch_id: params.branch_id });
  },

  async getTopItems(params) {
    const limit = Math.min(Math.max(Number(params.limit) || 10, 1), 50);
    return AnalyticsModel.getTopItems({ branch_id: params.branch_id, limit });
  },

  async getPaymentMethods(params) {
    return AnalyticsModel.getPaymentMethods({ branch_id: params.branch_id });
  },

  // ─── Module 3: Customer ──────────────────────────────────────

  async getCustomerAnalytics(params) {
    return AnalyticsModel.getCustomerAnalytics({ branch_id: params.branch_id });
  },

  async getLoyaltyAnalytics(params) {
    return AnalyticsModel.getLoyaltyAnalytics({ branch_id: params.branch_id });
  },

  // ─── Module 4: Inventory ────────────────────────────────────

  async getStockReport(params) {
    return AnalyticsModel.getStockReport({ branch_id: params.branch_id });
  },

  async getPurchaseReport(params) {
    return AnalyticsModel.getPurchaseReport({ branch_id: params.branch_id });
  },
};

module.exports = AnalyticsService;