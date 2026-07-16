import { api } from "./axios";

/**
 * Maps 1:1 to src/routes/auth.routes.js on the backend:
 *   POST /api/auth/login
 *   GET  /api/auth/me
 *   POST /api/auth/logout
 */
export const authService = {
  async login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    return data.data; // { token, user }
  },

  async googleLogin(credential) {
    const { data } = await api.post("/auth/google", { credential });
    return data.data; // { token, user }
  },

  async getCurrentUser() {
    const { data } = await api.get("/auth/me");
    return data.data; // { id, name, email, role, branch_id, permissions }
  },

  async logout() {
    const { data } = await api.post("/auth/logout");
    return data;
  },
};