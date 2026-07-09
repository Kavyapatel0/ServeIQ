import { createSlice } from "@reduxjs/toolkit";

/**
 * Placeholder store for the notification bell in the top navbar.
 * Real-time push (new order, low stock, order ready) gets wired into
 * this slice once Socket.IO listeners are added in the Kitchen/POS
 * frontend phases — the shape is defined now so the Navbar has
 * something real to render against from Phase 1 onward.
 */
const initialState = {
  items: [], // { id, title, message, read, created_at }
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification(state, action) {
      state.items.unshift({ read: false, ...action.payload });
    },
    markAllRead(state) {
      state.items.forEach((n) => (n.read = true));
    },
    clearNotifications(state) {
      state.items = [];
    },
  },
});

export const { addNotification, markAllRead, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;

export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) =>
  state.notifications.items.filter((n) => !n.read).length;
