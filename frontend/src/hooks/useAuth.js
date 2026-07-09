import { useDispatch, useSelector } from "react-redux";
import {
  loginUser,
  logoutUser,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthStatus,
  selectAuthError,
  selectBootstrapped,
  selectPermissions,
} from "@/redux/slices/authSlice";

/**
 * Single entry point for auth state and actions across the app.
 * Components should never import from redux/slices/authSlice directly —
 * go through this hook so the state shape can evolve without touching
 * every consumer.
 */
export function useAuth() {
  const dispatch = useDispatch();

  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const bootstrapped = useSelector(selectBootstrapped);
  const permissions = useSelector(selectPermissions);

  const login = (email, password) => dispatch(loginUser({ email, password }));
  const logout = () => dispatch(logoutUser());

  return {
    user,
    isAuthenticated,
    isLoading: status === "loading",
    error,
    bootstrapped,
    permissions,
    login,
    logout,
  };
}
