import { api } from "./axios";

// Real backend field names (confirmed):
// Menu items:  id, name, description, selling_price, is_available (1/0), category_id, category_name
// Tables:      id, table_number, capacity, status, branch_id, branch_name
// Customers:   id, name, email, phone, loyalty_points

// ─── Menu ─────────────────────────────────────────────────────────────────
export const getMenuCategories = () =>
  api.get("/menu/categories").then((r) => ({
    categories: (r.data?.data ?? []).map((c) => ({
      id:   c.id,
      name: c.name,
    })),
  }));

export const getMenuItems = (params = {}) =>
  api.get("/menu/items", { params }).then((r) => ({
    items: (r.data?.data ?? []).map((item) => ({
      id:           item.id,
      name:         item.name,
      description:  item.description ?? "",
      price:        parseFloat(item.selling_price ?? item.price ?? 0),
      is_available: item.is_available === 1 || item.is_available === true,
      category: {
        id:   item.category_id,
        name: item.category_name ?? "",
      },
      image_url: item.image_url ?? null,
    })),
  }));

// ─── Tables ───────────────────────────────────────────────────────────────
export const getTables = () =>
  api.get("/tables").then((r) => ({
    tables: (r.data?.data ?? []).map((t) => ({
      id:     t.id,
      name:   t.table_number,          // UI expects "name"
      number: t.table_number,
      status: t.status,
      capacity: t.capacity,
    })),
  }));

// ─── Customers ────────────────────────────────────────────────────────────
export const searchCustomers = (query) =>
  api.get("/customers", { params: { search: query, limit: 10 } }).then((r) => ({
    customers: r.data?.data ?? [],
  }));

export const createCustomer = (data) =>
  api.post("/customers", data).then((r) => r.data?.data ?? r.data);

// ─── Coupons ──────────────────────────────────────────────────────────────
export const validateCoupon = (code, orderTotal) =>
  api.post("/coupons/validate", { code, order_total: orderTotal })
    .then((r) => r.data?.data ?? r.data);

// ─── Orders ───────────────────────────────────────────────────────────────
export const createOrder = (data) =>
  api.post("/orders", data).then((r) => ({
    order: r.data?.data ?? r.data,
  }));

export const getOrders = (params = {}) =>
  api.get("/orders", { params }).then((r) => ({
    orders: r.data?.data ?? [],
  }));

export const getOrderById = (id) =>
  api.get(`/orders/${id}`).then((r) => r.data?.data ?? r.data);

// ─── Payments ─────────────────────────────────────────────────────────────
export const createPayment = (data) =>
  api.post("/payments", data).then((r) => r.data?.data ?? r.data);
