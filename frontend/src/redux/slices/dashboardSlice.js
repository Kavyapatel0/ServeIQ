import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dashboardService } from "@/services/dashboard.service";

/**
 * Each dashboard widget owns an independent { data, status, error }
 * resource rather than one big "dashboardData" blob. Widgets are
 * gated by permission (Cashier never calls the kitchen endpoint,
 * Chef never calls analytics, etc.), so a single shared loading/error
 * flag would be meaningless — one widget failing shouldn't block or
 * blank out the others, and each needs its own retry.
 */

const makeThunk = (name, fn) =>
  createAsyncThunk(`dashboard/${name}`, async (arg, { rejectWithValue }) => {
    try {
      return await fn(arg);
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load.");
    }
  });

export const fetchRevenue = makeThunk("fetchRevenue", () => dashboardService.getTodayRevenue());
export const fetchDailySales = makeThunk("fetchDailySales", () => dashboardService.getDailySales(7));
export const fetchTopItems = makeThunk("fetchTopItems", () => dashboardService.getTopItems(5));
export const fetchKitchenDashboard = makeThunk("fetchKitchenDashboard", () =>
  dashboardService.getKitchenDashboard()
);
export const fetchInventoryDashboard = makeThunk("fetchInventoryDashboard", () =>
  dashboardService.getInventoryDashboard()
);
export const fetchLowStock = makeThunk("fetchLowStock", () => dashboardService.getLowStock());
export const fetchRecentOrders = makeThunk("fetchRecentOrders", () => dashboardService.getRecentOrders());
export const fetchTables = makeThunk("fetchTables", () => dashboardService.getTables());

const resource = () => ({ data: null, status: "idle", error: null });

const initialState = {
  revenue: resource(),
  dailySales: resource(),
  topItems: resource(),
  kitchen: resource(),
  inventory: resource(),
  lowStock: resource(),
  recentOrders: resource(),
  tables: resource(),
};

// Wires pending/fulfilled/rejected for a thunk onto a single state key,
// so adding a new widget resource is a one-line addition below.
function attach(builder, thunk, key) {
  builder
    .addCase(thunk.pending, (state) => {
      state[key].status = "loading";
      state[key].error = null;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      state[key].status = "succeeded";
      state[key].data = action.payload;
    })
    .addCase(thunk.rejected, (state, action) => {
      state[key].status = "failed";
      state[key].error = action.payload;
    });
}

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    attach(builder, fetchRevenue, "revenue");
    attach(builder, fetchDailySales, "dailySales");
    attach(builder, fetchTopItems, "topItems");
    attach(builder, fetchKitchenDashboard, "kitchen");
    attach(builder, fetchInventoryDashboard, "inventory");
    attach(builder, fetchLowStock, "lowStock");
    attach(builder, fetchRecentOrders, "recentOrders");
    attach(builder, fetchTables, "tables");
  },
});

export default dashboardSlice.reducer;

// ─── Selectors ──────────────────────────────────────────────────────────
export const selectRevenue = (state) => state.dashboard.revenue;
export const selectDailySales = (state) => state.dashboard.dailySales;
export const selectTopItems = (state) => state.dashboard.topItems;
export const selectKitchen = (state) => state.dashboard.kitchen;
export const selectInventory = (state) => state.dashboard.inventory;
export const selectLowStock = (state) => state.dashboard.lowStock;
export const selectRecentOrders = (state) => state.dashboard.recentOrders;
export const selectTables = (state) => state.dashboard.tables;