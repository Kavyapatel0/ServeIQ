import { createSlice } from "@reduxjs/toolkit";

/**
 * Most roles are pinned to a single branch_id from their JWT and never
 * touch this slice. It exists for Super Admin, who has branch_id = null
 * and can switch which branch's data they're viewing across POS,
 * Kitchen, Inventory, etc.
 */
const initialState = {
  selectedBranchId: null,
  branches: [], // populated from GET /api/branches once that endpoint is wired in
};

const branchSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {
    setSelectedBranch(state, action) {
      state.selectedBranchId = action.payload;
    },
    setBranches(state, action) {
      state.branches = action.payload;
    },
  },
});

export const { setSelectedBranch, setBranches } = branchSlice.actions;
export default branchSlice.reducer;

export const selectSelectedBranchId = (state) => state.branch.selectedBranchId;
export const selectBranches = (state) => state.branch.branches;
