import { Routes, Route, Navigate } from "react-router-dom";

import { ROUTES } from "@/constants/routes";
import { PERMISSIONS } from "@/constants/permissions";

import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ProtectedRoute } from "./ProtectedRoute";

import { LoginPage } from "@/pages/auth/LoginPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { ProfilePage } from "@/pages/dashboard/ProfilePage";
import { SettingsPage } from "@/pages/dashboard/SettingsPage";
import { POSPage } from "@/pages/pos/POSPage";
import { KitchenPage } from "@/pages/kitchen/KitchenPage";
import { InventoryPage } from "@/pages/inventory/InventoryPage";
import { CRMPage } from "@/pages/crm/CRMPage";
import { AnalyticsPage } from "@/pages/analytics/AnalyticsPage";
import { AdminPage } from "@/pages/admin/AdminPage";
import { NotFoundPage } from "@/pages/errors/NotFoundPage";
import { ForbiddenPage } from "@/pages/errors/ForbiddenPage";

export function AppRoutes() {
  return (
    <Routes>
      {/* ─── Public auth routes ────────────────────────────────── */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      </Route>

      {/* ─── Standalone error pages (no sidebar/navbar) ───────────── */}
      <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />

      {/* ─── Protected application shell ──────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />

          <Route element={<ProtectedRoute permission={PERMISSIONS.ORDERS_VIEW} />}>
            <Route path={ROUTES.POS} element={<POSPage />} />
          </Route>

          <Route element={<ProtectedRoute permission={PERMISSIONS.KITCHEN_VIEW} />}>
            <Route path={ROUTES.KITCHEN} element={<KitchenPage />} />
          </Route>

          <Route element={<ProtectedRoute permission={PERMISSIONS.INVENTORY_VIEW} />}>
            <Route path={ROUTES.INVENTORY} element={<InventoryPage />} />
          </Route>

          <Route element={<ProtectedRoute permission={PERMISSIONS.CRM_VIEW} />}>
            <Route path={ROUTES.CRM} element={<CRMPage />} />
          </Route>

          <Route element={<ProtectedRoute permission={PERMISSIONS.ANALYTICS_VIEW} />}>
            <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
          </Route>

          <Route element={<ProtectedRoute permission={PERMISSIONS.USERS_VIEW} />}>
            <Route path={ROUTES.ADMIN} element={<AdminPage />} />
          </Route>
        </Route>
      </Route>

      {/* ─── Fallbacks ─────────────────────────────────────────────── */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
    </Routes>
  );
}
