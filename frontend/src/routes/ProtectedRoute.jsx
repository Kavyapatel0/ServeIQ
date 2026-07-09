import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePermission } from "@/hooks/usePermission";
import { ROUTES } from "@/constants/routes";
import { PageLoader } from "@/components/common/PageLoader";

/**
 * Wraps any route (or nested route group) that requires a logged-in
 * user. Redirects to /login and remembers the attempted location so
 * we can send the user back after they authenticate.
 *
 * Pass `permission` (a single PERMISSIONS.* value) to additionally
 * gate the route by RBAC — anyone authenticated but lacking that
 * permission is redirected to /403 rather than seeing the page.
 */
export function ProtectedRoute({ permission }) {
  const { isAuthenticated, bootstrapped } = useAuth();
  const { can } = usePermission();
  const location = useLocation();

  // Still restoring the session from a stored token — avoid a login
  // flash for users who are actually already authenticated.
  if (!bootstrapped) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (permission && !can(permission)) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  return <Outlet />;
}
