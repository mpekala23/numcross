import {
  backendGetLeaderboard,
  backendGetPrivateLeaderboard,
} from "@/api/backend";
import { LeaderboardStats, PrivateLeaderboardStats } from "@/types/stats";
import { LoadingStatus } from "@/types/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";

// State
export interface LeaderboardsState {
  privateStatus: LoadingStatus;
  private: PrivateLeaderboardStats | null;
  publicStatus: LoadingStatus;
  public: LeaderboardStats | null;
}
const INITIAL_STATE: LeaderboardsState = {
  privateStatus: "idle",
  private: null,
  publicStatus: "idle",
  public: null,
};

// Async actions
export const refreshPublicLeaderboard = createAsyncThunk(
  "leaderboards/refreshPublicLeaderboard",
  async () => {
    return await backendGetLeaderboard();
  }
);

export const refreshPrivateLeaderboard = createAsyncThunk(
  "leaderboards/refreshPrivateLeaderboard",
  async ({ userId }: { userId: string }) => {
    return await backendGetPrivateLeaderboard(userId);
  }
);

// Slice
export const leaderboardsSlice = createSlice({
  name: "leaderboards",
  initialState: INITIAL_STATE,
  reducers: {},
  extraReducers(builder) {
    builder
      // refreshPublicLeaderboard
      .addCase(refreshPublicLeaderboard.pending, (state) => {
        state.publicStatus =
          state.publicStatus === "idle" ? "loading" : "reloading";
      })
      .addCase(refreshPublicLeaderboard.fulfilled, (state, action) => {
        state.publicStatus = "success";
        state.public = action.payload;
      })
      .addCase(refreshPublicLeaderboard.rejected, (state, action) => {
        state.publicStatus = "error";
        toast(action.error.message || "", { icon: "🚫" });
      })
      // refreshPrivateLeaderboard
      .addCase(refreshPrivateLeaderboard.pending, (state) => {
        state.privateStatus =
          state.privateStatus === "idle" ? "loading" : "reloading";
      })
      .addCase(refreshPrivateLeaderboard.fulfilled, (state, action) => {
        state.privateStatus = "success";
        state.private = action.payload;
      })
      .addCase(refreshPrivateLeaderboard.rejected, (state, action) => {
        state.privateStatus = "error";
        toast(action.error.message || "", { icon: "🚫" });
      });
  },
});

export default leaderboardsSlice.reducer;
