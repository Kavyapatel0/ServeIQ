import { api } from "./axios";

// Real backend endpoints (confirmed working):
// GET  /api/ingredients            → { data: [...] }
// POST /api/ingredients            → { data: {...} }
// PUT  /api/ingredients/:id        → { data: {...} }
// DELETE /api/ingredients/:id      → { data: {...} }
// GET  /api/inventory/low-stock    → { data: [...] }
// GET  /api/suppliers              → { data: [...] }
// POST /api/suppliers              → { data: {...} }
// PUT  /api/suppliers/:id          → { data: {...} }
// GET  /api/purchase-orders        → { data: [...] }
// POST /api/purchase-orders        → { data: {...} }
// PATCH /api/purchase-orders/:id/receive  → { data: {...} }
// PATCH /api/purchase-orders/:id/cancel   → { data: {...} }
// GET  /api/inventory/dashboard    → { data: {...} }

// ─── Ingredients ──────────────────────────────────────────────────────────
export const getIngredients = (params = {}) =>
  api.get("/ingredients", { params }).then((r) => ({
    ingredients: r.data?.data ?? [],
  }));

export const createIngredient = (data) =>
  api.post("/ingredients", data).then((r) => r.data?.data ?? r.data);

export const updateIngredient = (id, data) =>
  api.put(`/ingredients/${id}`, data).then((r) => r.data?.data ?? r.data);

export const deleteIngredient = (id) =>
  api.delete(`/ingredients/${id}`).then((r) => r.data);

export const getLowStock = () =>
  api.get("/inventory/low-stock").then((r) => ({
    ingredients: r.data?.data ?? [],
  }));

// ─── Suppliers ────────────────────────────────────────────────────────────
export const getSuppliers = (params = {}) =>
  api.get("/suppliers", { params }).then((r) => ({
    suppliers: r.data?.data ?? [],
  }));

export const createSupplier = (data) =>
  api.post("/suppliers", data).then((r) => r.data?.data ?? r.data);

export const updateSupplier = (id, data) =>
  api.put(`/suppliers/${id}`, data).then((r) => r.data?.data ?? r.data);

// ─── Purchase Orders ──────────────────────────────────────────────────────
export const getPurchaseOrders = (params = {}) =>
  api.get("/purchase-orders", { params }).then((r) => ({
    purchase_orders: r.data?.data ?? [],
  }));

export const createPurchaseOrder = (data) =>
  api.post("/purchase-orders", data).then((r) => r.data?.data ?? r.data);

export const receivePurchaseOrder = (id, data) =>
  api.patch(`/purchase-orders/${id}/receive`, data).then((r) => r.data?.data ?? r.data);

export const cancelPurchaseOrder = (id) =>
  api.patch(`/purchase-orders/${id}/cancel`).then((r) => r.data?.data ?? r.data);

// ─── Inventory Transactions ───────────────────────────────────────────────
export const getInventoryTransactions = (params = {}) =>
  api.get("/inventory/transactions", { params })
    .then((r) => ({ transactions: r.data?.data ?? [] }))
    .catch(() => ({ transactions: [] }));

// ─── Dashboard ────────────────────────────────────────────────────────────
export const getInventoryDashboard = () =>
  api.get("/inventory/dashboard").then((r) => r.data?.data ?? null);
