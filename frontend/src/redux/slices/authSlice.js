import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "@/services/auth.service";
import { tokenStorage } from "@/services/axios";

/**
 * Attempts to log in and persists the token on success.
 * Rejected value is a plain string message, so components can show
 * `result.payload` directly in a toast.
 */
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const result = await authService.login(email, password);
      tokenStorage.set(result.token);
      return result.user;
    } catch (err) {
      return rejectWithValue(err.message || "Login failed.");
    }
  }
);

/**
 * Called once on app load if a token already exists in storage, to
 * restore the session without forcing a re-login on every refresh.
 */
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getCurrentUser();
    } catch (err) {
      return rejectWithValue(err.message || "Session expired.");
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    await authService.logout();
  } finally {
    tokenStorage.clear();
  }
});

const initialState = {
  user: null, // { id, name, email, role, branch_id, permissions }
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
  // Distinguishes "we haven't checked for a session yet" from "checked,
  // and there isn't one" — ProtectedRoute shows a full-page loader only
  // until this flips true, never again after.
  bootstrapped: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    // Dispatched once at app boot when no token is in storage at all,
    // so we skip the network round-trip but still flip `bootstrapped`
    // to true — otherwise ProtectedRoute would show PageLoader forever.
    sessionChecked(state) {
      state.bootstrapped = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Session restore
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.bootstrapped = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.status = "idle";
        state.user = null;
        state.bootstrapped = true;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
      });
  },
});

export const { clearAuthError, sessionChecked } = authSlice.actions;
export default authSlice.reducer;

// ─── Selectors ──────────────────────────────────────────────────────────
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => Boolean(state.auth.user);
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectBootstrapped = (state) => state.auth.bootstrapped;
export const selectPermissions = (state) => state.auth.user?.permissions ?? [];
