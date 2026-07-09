import { useSelector } from "react-redux";
import { selectPermissions } from "@/redux/slices/authSlice";
import { hasPermission, hasAnyPermission } from "@/utils/permissions";

/**
 * Usage:
 *   const { can, canAny } = usePermission();
 *   if (can(PERMISSIONS.MENU_MANAGE)) { ... }
 *   if (canAny([PERMISSIONS.ORDERS_VIEW, PERMISSIONS.ORDERS_CREATE])) { ... }
 */
export function usePermission() {
  const permissions = useSelector(selectPermissions);

  return {
    permissions,
    can: (permission) => hasPermission(permissions, permission),
    canAny: (permissionList) => hasAnyPermission(permissions, permissionList),
  };
}
