import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Desktop: collapse the sidebar to icon-only width (persists as the user's choice).
  sidebarCollapsed: false,
  // Mobile/tablet: sidebar renders as an off-canvas drawer instead, toggled by the hamburger button.
  mobileSidebarOpen: false,
  theme: "light", // reserved for future dark-mode support
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action) {
      state.sidebarCollapsed = action.payload;
    },
    toggleMobileSidebar(state) {
      state.mobileSidebarOpen = !state.mobileSidebarOpen;
    },
    closeMobileSidebar(state) {
      state.mobileSidebarOpen = false;
    },
    setTheme(state, action) {
      state.theme = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleMobileSidebar,
  closeMobileSidebar,
  setTheme,
} = uiSlice.actions;
export default uiSlice.reducer;

export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
export const selectMobileSidebarOpen = (state) => state.ui.mobileSidebarOpen;
export const selectTheme = (state) => state.ui.theme;