import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import branchReducer from "./slices/branchSlice";
import notificationReducer from "./slices/notificationSlice";
import dashboardReducer from "./slices/dashboardSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    branch: branchReducer,
    notifications: notificationReducer,
    dashboard: dashboardReducer,
  },
});