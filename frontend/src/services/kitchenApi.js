import { api } from "./axios";

/**
 * Kitchen API — every call here maps 1:1 to backend/src/routes/kitchen.routes.js.
 *
 * Status changes are NOT a generic PUT with a status body — the backend
 * exposes one dedicated PATCH endpoint per legal transition
 * (PENDING→PREPARING, PREPARING→READY, READY→SERVED), enforced server-side
 * by KitchenService.updateStatus(). `advanceStatus` below maps a target
 * status to the right endpoint so the rest of the app can stay agnostic.
 */

const STATUS_ENDPOINT = {
  PREPARING: "preparing",
  READY: "ready",
  SERVED: "served",
};

export const getKitchenOrders = (params = {}) =>
  api.get("/kitchen/orders", { params }).then((r) => r.data.data);

export const getKitchenOrderById = (id) =>
  api.get(`/kitchen/orders/${id}`).then((r) => r.data.data);

export const getKitchenDashboard = () =>
  api.get("/kitchen/dashboard").then((r) => r.data.data);

/** targetStatus must be "PREPARING" | "READY" | "SERVED" */
export const advanceKitchenOrderStatus = (id, targetStatus) => {
  const segment = STATUS_ENDPOINT[targetStatus];
  if (!segment) {
    return Promise.reject(new Error(`Unsupported kitchen status transition: ${targetStatus}`));
  }
  return api.patch(`/kitchen/orders/${id}/${segment}`).then((r) => r.data.data);
};

/** Dismiss / clear a SERVED order from the kitchen board by marking it COMPLETED */
export const dismissServedOrder = (id) =>
  api.patch(`/orders/${id}/status`, { status: "COMPLETED" }).then((r) => r.data?.data ?? r.data);