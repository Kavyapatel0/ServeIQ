/**
 * Returns true if the user's permissions array includes the given key.
 * A null/undefined `permission` argument always passes — used for
 * nav items or pages every authenticated user may see.
 */
export function hasPermission(userPermissions, permission) {
  if (!permission) return true;
  if (!Array.isArray(userPermissions)) return false;
  return userPermissions.includes(permission);
}

/**
 * Returns true if the user has AT LEAST ONE of the given permissions.
 * Mirrors the backend's authorize(...perms) OR-style check.
 */
export function hasAnyPermission(userPermissions, permissions = []) {
  if (!permissions.length) return true;
  if (!Array.isArray(userPermissions)) return false;
  return permissions.some((p) => userPermissions.includes(p));
}
