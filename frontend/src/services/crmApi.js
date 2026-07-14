import { api } from "./axios";

// Real backend endpoints confirmed:
// GET  /api/customers              → { data: [...] }
// GET  /api/customers/:id          → { data: {...} }
// POST /api/customers              → { data: {...} }
// PUT  /api/customers/:id          → { data: {...} }
// GET  /api/orders?customer_id=:id → { data: [...] }   ← customer order history
// GET  /api/coupons                → { data: [...] }
// POST /api/coupons                → { data: {...} }
// PUT  /api/coupons/:id            → { data: {...} }
// DELETE /api/coupons/:id          → { data: {...} }
// NOTE: /loyalty/transactions and /loyalty/dashboard do NOT exist on this backend.

// ─── Customers ────────────────────────────────────────────────────────────
export const getCustomers = (params = {}) =>
  api.get("/customers", { params }).then((r) => ({
    customers: r.data?.data ?? [],
  }));

export const getCustomerById = (id) =>
  api.get(`/customers/${id}`).then((r) => r.data?.data ?? null);

export const createCustomer = (data) =>
  api.post("/customers", data).then((r) => ({
    customer: r.data?.data ?? r.data,
  }));

export const updateCustomer = (id, data) =>
  api.put(`/customers/${id}`, data).then((r) => r.data?.data ?? r.data);

// Customer order history via /orders?customer_id=:id
export const getCustomerOrders = (id, params = {}) =>
  api.get("/orders", { params: { ...params, customer_id: id } }).then((r) => ({
    orders: r.data?.data ?? [],
  }));

// ─── Loyalty (no dedicated endpoints — derive from customers list) ─────────
export const getLoyaltyTransactions = (params = {}) =>
  // No /loyalty/transactions endpoint; return empty gracefully
  Promise.resolve({ transactions: [] });

export const getLoyaltyDashboard = () =>
  // Derive basic stats from customers endpoint
  api.get("/customers", { params: { limit: 1000 } }).then((r) => {
    const customers = r.data?.data ?? [];
    const total = customers.length;
    const withPoints = customers.filter((c) => (c.loyalty_points ?? 0) > 0).length;
    const totalPoints = customers.reduce((s, c) => s + (Number(c.loyalty_points) || 0), 0);
    return {
      total_customers: total,
      active_members: withPoints,
      total_points_issued: totalPoints,
      total_points_redeemed: 0,
    };
  }).catch(() => null);

// ─── Coupons ──────────────────────────────────────────────────────────────
export const getCoupons = (params = {}) =>
  api.get("/coupons", { params }).then((r) => ({
    coupons: r.data?.data ?? [],
  }));

export const createCoupon = (data) =>
  api.post("/coupons", data).then((r) => r.data?.data ?? r.data);

export const updateCoupon = (id, data) =>
  api.put(`/coupons/${id}`, data).then((r) => r.data?.data ?? r.data);

export const deleteCoupon = (id) =>
  api.delete(`/coupons/${id}`).then((r) => r.data);

export const getCouponUsage = (params = {}) =>
  api.get("/coupons/usage", { params }).then((r) => ({
    usage: r.data?.data ?? [],
  })).catch(() => ({ usage: [] }));
