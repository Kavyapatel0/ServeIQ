import { api } from "./axios";

// Real backend endpoints confirmed:
// GET  /api/auth/me                → { data: {...} }
// GET  /api/users                  → { data: [...] }
// GET  /api/users/:id              → { data: {...} }
// POST /api/users                  → { data: {...} }
// PUT  /api/users/:id              → { data: {...} }
// DELETE /api/users/:id            → { data: {...} }
// NOTE: /branches does NOT exist — branch info comes from user.branch on /auth/me

export const getUserProfile = () =>
  api.get("/auth/me").then((r) => r.data?.data ?? null);

export const updateUserProfile = (data) =>
  api.put("/users/profile", data).then((r) => r.data?.data ?? r.data);

export const changePassword = (data) =>
  api.put("/users/change-password", data).then((r) => r.data);

export const getBranchDetails = (id) =>
  api.get(`/users/${id}`).then((r) => r.data?.data?.branch ?? null).catch(() => null);

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

// No /branches endpoint — return branch data from users list
export const getBranches = () =>
  api.get("/users", { params: { limit: 200 } }).then((r) => {
    const users = r.data?.data ?? [];
    // Collect unique branches from users
    const branchMap = new Map();
    users.forEach((u) => {
      if (u.branch_id && u.branch_name) {
        if (!branchMap.has(u.branch_id)) {
          branchMap.set(u.branch_id, {
            id: u.branch_id,
            name: u.branch_name,
            is_active: true,
          });
        }
      }
    });
    return {
      branches: Array.from(branchMap.values()),
    };
  }).catch(() => ({ branches: [] }));
