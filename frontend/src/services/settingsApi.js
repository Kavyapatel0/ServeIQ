import { api } from "./axios";

// Real backend endpoints:
// GET  /api/auth/me                → { data: {...} }
// GET  /api/users                  → { data: [...] }
// GET  /api/users/:id              → { data: {...} }
// POST /api/users                  → { data: {...} }
// PUT  /api/users/:id              → { data: {...} }
// DELETE /api/users/:id            → { data: {...} }
// GET  /api/users/roles            → { data: [...] }   ← real roles list
// GET  /api/users/branches         → { data: [...] }   ← real branches list

export const getUserProfile = () =>
  api.get("/auth/me").then((r) => r.data?.data ?? null);

export const updateUserProfile = (data) =>
  api.put("/users/profile", data).then((r) => r.data?.data ?? r.data);

export const changePassword = (data) =>
  api.put("/users/change-password", data).then((r) => r.data);

export const getUsers = (params = {}) =>
  api.get("/users", { params }).then((r) => ({
    users: r.data?.data ?? [],
  }));

export const createUser = (data) =>
  api.post("/users", data).then((r) => r.data?.data ?? r.data);

export const updateUser = (id, data) =>
  api.put(`/users/${id}`, data).then((r) => r.data?.data ?? r.data);

export const deleteUser = (id) =>
  api.delete(`/users/${id}`).then((r) => r.data);

// GET /api/users/roles — returns [{ id, name }]
export const getRoles = () =>
  api.get("/users/roles").then((r) => ({
    roles: r.data?.data ?? [],
  }));

// GET /api/users/branches — returns [{ id, name, address, phone, is_active }]
export const getBranches = () =>
  api.get("/users/branches").then((r) => ({
    branches: (r.data?.data ?? []).map((b) => ({
      id: b.id,
      name: b.name,
      address: b.address ?? null,
      phone: b.phone ?? null,
      is_active: b.is_active !== 0,
    })),
  }));
