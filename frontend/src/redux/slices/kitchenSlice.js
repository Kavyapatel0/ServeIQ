import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as kitchenApi from "@/services/kitchenApi";

export const fetchKitchenOrders = createAsyncThunk(
  "kitchen/fetchOrders",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await kitchenApi.getKitchenOrders(params);
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load kitchen orders.");
    }
  }
);

export const fetchKitchenDashboard = createAsyncThunk(
  "kitchen/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      return await kitchenApi.getKitchenDashboard();
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load kitchen stats.");
    }
  }
);

/**
 * Advances one order to its next legal status via the matching
 * dedicated PATCH endpoint (see kitchenApi.advanceKitchenOrderStatus).
 */
export const advanceOrderStatus = createAsyncThunk(
  "kitchen/advanceStatus",
  async ({ id, targetStatus }, { rejectWithValue }) => {
    try {
      const data = await kitchenApi.advanceKitchenOrderStatus(id, targetStatus);
      return { id, status: targetStatus, data };
    } catch (err) {
      return rejectWithValue({ id, message: err.message || "Failed to update order status." });
    }
  }
);

/**
 * Dismiss a SERVED order from the kitchen board (marks it COMPLETED).
 */
export const dismissServedOrder = createAsyncThunk(
  "kitchen/dismissServed",
  async (id, { rejectWithValue }) => {
    try {
      await kitchenApi.dismissServedOrder(id);
      return { id };
    } catch (err) {
      return rejectWithValue({ id, message: err.message || "Failed to dismiss order." });
    }
  }
);

const kitchenSlice = createSlice({
  name: "kitchen",
  initialState: {
    orders: [],
    status: "idle",
    error: null,

    dashboard: { data: null, status: "idle", error: null },

    socketConnected: false,
    filter: "ALL",
    searchQuery: "",
    updatingId: null,
  },
  reducers: {
    setSocketConnected(state, action) {
      state.socketConnected = action.payload;
    },
    // Applied when the shared socket confirms a status change made by
    // ANY branch client (including this one) — keeps every open
    // kitchen/POS screen in sync without a refetch.
    patchOrderStatus(state, action) {
      const { id, status } = action.payload;
      const order = state.orders.find((o) => o.id === id);
      if (order) order.status = status;
    },
    setFilter(state, action) {
      state.filter = action.payload;
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKitchenOrders.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchKitchenOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.orders = action.payload ?? [];
      })
      .addCase(fetchKitchenOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(fetchKitchenDashboard.pending, (state) => {
        state.dashboard.status = "loading";
        state.dashboard.error = null;
      })
      .addCase(fetchKitchenDashboard.fulfilled, (state, action) => {
        state.dashboard.status = "succeeded";
        state.dashboard.data = action.payload;
      })
      .addCase(fetchKitchenDashboard.rejected, (state, action) => {
        state.dashboard.status = "failed";
        state.dashboard.error = action.payload;
      })

      .addCase(advanceOrderStatus.pending, (state, action) => {
        state.updatingId = action.meta.arg.id;
      })
      .addCase(advanceOrderStatus.fulfilled, (state, action) => {
        state.updatingId = null;
        const { id, status } = action.payload;
        const order = state.orders.find((o) => o.id === id);
        if (order) order.status = status;
        // Served orders age out of the board on the next refetch; the
        // dashboard counts are refreshed by the caller.
      })
      .addCase(advanceOrderStatus.rejected, (state) => {
        state.updatingId = null;
      })

      .addCase(dismissServedOrder.pending, (state, action) => {
        state.updatingId = action.meta.arg;
      })
      .addCase(dismissServedOrder.fulfilled, (state, action) => {
        state.updatingId = null;
        // Remove the dismissed order from local state immediately
        state.orders = state.orders.filter((o) => o.id !== action.payload.id);
      })
      .addCase(dismissServedOrder.rejected, (state) => {
        state.updatingId = null;
      });
  },
});

export const { setSocketConnected, patchOrderStatus, setFilter, setSearchQuery } =
  kitchenSlice.actions;

export const selectKitchenOrders = (state) => state.kitchen.orders;
export const selectKitchenStatus = (state) => state.kitchen.status;
export const selectKitchenError = (state) => state.kitchen.error;
export const selectKitchenFilter = (state) => state.kitchen.filter;
export const selectKitchenSearch = (state) => state.kitchen.searchQuery;
export const selectSocketConnected = (state) => state.kitchen.socketConnected;
export const selectUpdatingId = (state) => state.kitchen.updatingId;
export const selectKitchenDashboard = (state) => state.kitchen.dashboard;

export const selectOrdersByStatus = (status) => (state) =>
  state.kitchen.orders.filter((o) => o.status === status);

export default kitchenSlice.reducer;