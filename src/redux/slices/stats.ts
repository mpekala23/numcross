import { backendGetStats } from "@/api/backend";
import { UserStats } from "@/types/stats";
import { LoadingStatus } from "@/types/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";

// State
export interface StatsState {
  status: LoadingStatus;
  userStats: UserStats | null;
}
const INITIAL_STATE: StatsState = {
  status: "idle",
  userStats: null,
};

// Async actions
export const refreshUserStats = createAsyncThunk(
  "stats/refreshUserStats",
  async ({ userId }: { userId: string }) => {
    return await backendGetStats(userId);
  }
);

// Slice
export const statsSlice = createSlice({
  name: "stats",
  initialState: INITIAL_STATE,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(refreshUserStats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(refreshUserStats.fulfilled, (state, action) => {
        state.status = "success";
        state.userStats = action.payload;
      })
      .addCase(refreshUserStats.rejected, (state, action) => {
        state.status = "error";
        toast(action.error.message || "", { icon: "🚫" });
      });
  },
});

export default statsSlice.reducer;
