import { api } from "./axios";

// Real backend endpoints confirmed:
// GET /api/analytics/revenue            → { data: { total_revenue, total_orders, average_order_value, revenue_change_pct } }
// GET /api/analytics/sales              → { data: { total_orders, completed_orders, cancelled_orders, active_orders, average_bill, highest_bill, lowest_bill } }
// GET /api/analytics/sales/daily        → { data: [ { sale_date, revenue, order_count } ] }
// GET /api/analytics/peak-hours         → { data: [ { hour, hour_label, order_count, revenue } ] }
// GET /api/analytics/payment-methods    → { data: [ { payment_method, transaction_count, total_revenue, percentage } ] }
// GET /api/analytics/customers          → { data: { total_customers, new_customers, returning_customers, ... } }
// GET /api/analytics/top-items          → may return 500 on empty DB
// NOTE: /analytics/overview, /analytics/monthly-sales, /analytics/daily-sales do NOT exist.

// ─── Overview / Revenue ───────────────────────────────────────────────────
export const getAnalyticsOverview = (params = {}) =>
  Promise.all([
    api.get("/analytics/revenue", { params }).then((r) => r.data?.data ?? {}).catch(() => ({})),
    api.get("/analytics/sales",   { params }).then((r) => r.data?.data ?? {}).catch(() => ({})),
  ]).then(([rev, sales]) => ({ ...rev, ...sales }));

export const getSalesSummary = (params = {}) =>
  api.get("/analytics/sales", { params }).then((r) => r.data?.data ?? null).catch(() => null);

// ─── Sales ────────────────────────────────────────────────────────────────
export const getDailySales = (params = {}) =>
  api.get("/analytics/sales/daily", { params })
    .then((r) => ({
      sales: (r.data?.data ?? []).map((d) => ({
        date:    (d.sale_date ?? d.date ?? "").slice(0, 10),
        revenue: parseFloat(d.revenue ?? 0),
        orders:  parseInt(d.order_count ?? d.orders ?? 0),
      })),
    }))
    .catch(() => ({ sales: [] }));

// Monthly: aggregate daily data by month
export const getMonthlySales = (params = {}) =>
  api.get("/analytics/sales/daily", { params })
    .then((r) => {
      const raw = r.data?.data ?? [];
      const byMonth = {};
      raw.forEach((d) => {
        const month = (d.sale_date ?? d.date ?? "").slice(0, 7);
        if (!month) return;
        if (!byMonth[month]) byMonth[month] = { month, revenue: 0, orders: 0 };
        byMonth[month].revenue += parseFloat(d.revenue ?? 0);
        byMonth[month].orders  += parseInt(d.order_count ?? 0);
      });
      return { sales: Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month)) };
    })
    .catch(() => ({ sales: [] }));

// ─── Business ─────────────────────────────────────────────────────────────
export const getPeakHours = (params = {}) =>
  api.get("/analytics/peak-hours", { params })
    .then((r) => ({
      peak_hours: (r.data?.data ?? []).map((d) => ({
        hour:        d.hour_label ?? `${d.hour}:00`,
        order_count: d.order_count ?? 0,
        revenue:     d.revenue ?? 0,
      })),
    }))
    .catch(() => ({ peak_hours: [] }));

export const getTopSellingItems = (params = {}) =>
  api.get("/analytics/top-items", { params })
    .then((r) => ({ items: r.data?.data ?? [] }))
    .catch(() => ({ items: [] }));   // returns 500 on empty DB — swallow silently

export const getPaymentMethodReport = (params = {}) =>
  api.get("/analytics/payment-methods", { params })
    .then((r) => ({
      methods: (r.data?.data ?? []).map((d) => ({
        method:  d.payment_method,
        count:   d.transaction_count ?? 0,
        revenue: d.total_revenue ?? 0,
        pct:     d.percentage ?? 0,
      })),
    }))
    .catch(() => ({ methods: [] }));

// ─── Customer Analytics ───────────────────────────────────────────────────
export const getCustomerAnalytics = (params = {}) =>
  api.get("/analytics/customers", { params })
    .then((r) => r.data?.data ?? null)
    .catch(() => null);

// ─── Unused / compat aliases ──────────────────────────────────────────────
export const getRevenueReport   = getAnalyticsOverview;
export const getLoyaltyReport   = () => Promise.resolve(null);
export const getStockReport     = () => Promise.resolve(null);
export const getPurchaseReport  = () => Promise.resolve(null);
