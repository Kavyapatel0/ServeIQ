import { api } from "./axios";

/**
 * Read-only aggregation layer for the Dashboard page. Every call here
 * maps to an existing backend endpoint — nothing new was added on the
 * backend for Phase 3, this file just gives the dashboard widgets a
 * single, typed place to fetch from.
 */
export const dashboardService = {
  /** GET /api/analytics/revenue?period=today — today's revenue, order count, trend vs yesterday */
  async getTodayRevenue() {
    const { data } = await api.get("/analytics/revenue", { params: { period: "today" } });
    return data.data;
  },

  /** GET /api/analytics/sales/daily?days=7 — powers the revenue chart */
  async getDailySales(days = 7) {
    const { data } = await api.get("/analytics/sales/daily", { params: { days } });
    return data.data;
  },

  /** GET /api/analytics/top-items?limit=5 */
  async getTopItems(limit = 5) {
    const { data } = await api.get("/analytics/top-items", { params: { limit } });
    return data.data;
  },

  /** GET /api/kitchen/dashboard — pending/preparing/ready/served_today counts */
  async getKitchenDashboard() {
    const { data } = await api.get("/kitchen/dashboard");
    return data.data;
  },

  /** GET /api/inventory/dashboard — ingredient + low-stock + purchase counts */
  async getInventoryDashboard() {
    const { data } = await api.get("/inventory/dashboard");
    return data.data;
  },

  /** GET /api/inventory/low-stock — used for the Inventory Alert widget */
  async getLowStock() {
    const { data } = await api.get("/inventory/low-stock");
    return data.data;
  },

  /** GET /api/orders — trimmed client-side to the 5 most recent (already sorted by the API) */
  async getRecentOrders() {
    const { data } = await api.get("/orders");
    return (data.data || []).slice(0, 5);
  },

  /** GET /api/tables — used for the Available Tables KPI and branch name */
  async getTables() {
    const { data } = await api.get("/tables");
    return data.data;
  },
};