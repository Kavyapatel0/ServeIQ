import axios from "axios";
import { toast } from "sonner";

/**
 * Centralized API client.
 *
 * Base URL resolution:
 *   - In dev, Vite's proxy (see vite.config.js) forwards /api/* to
 *     http://localhost:5000, so a relative "/api" works without CORS pain.
 *   - In production, set VITE_API_URL to the deployed backend origin.
 */
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

const TOKEN_KEY = "serveiq_token";

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// ─── Request interceptor: attach JWT to every outgoing request ────────────
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: centralized error handling ─────────────────────
// This is intentionally set up here (rather than in every service call) so
// a 401 anywhere in the app — an expired token, a revoked session — always
// funnels through one place. `onUnauthorized` is wired up once from App.jsx
// at app start to avoid a circular import between this file and the store.
let onUnauthorized = () => {};
export const registerUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error.message || "Something went wrong.";

    if (status === 401) {
      tokenStorage.clear();
      onUnauthorized();
      toast.error("Your session has expired. Please log in again.");
    } else if (status === 403) {
      toast.error("You don't have permission to do that.");
    } else if (status >= 500) {
      // Suppress toast for analytics/top-items which legitimately returns 500
      // on an empty database (no order history). All analytics 500s are caught
      // and returned as empty data by analyticsApi.js.
      const url = error?.config?.url ?? "";
      const isAnalytics = url.includes("/analytics/");
      if (!isAnalytics) {
        toast.error("Server error. Please try again in a moment.");
      }
    }
    // 400/404/409/422 are left for the calling code to handle contextually
    // (e.g. inline form errors) rather than a generic toast.

    return Promise.reject({ status, message, raw: error });
  }
);