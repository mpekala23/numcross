import { backendGetSolve, backendVerifyAttempt } from "@/api/backend";
import { VerifyAttemptResp } from "@/types/api";
import { Attempt, LoadingStatus, Solve } from "@/types/types";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import { AppState } from "../store";

// State
export interface ProgressState {
  attempt: Attempt | null;
  solve: Solve | null;
  fetchSolveStatus: LoadingStatus;
  verifyAttemptStatus: LoadingStatus;
  confetti: number;
}
const INITIAL_STATE: ProgressState = {
  attempt: null,
  solve: null,
  fetchSolveStatus: "idle",
  verifyAttemptStatus: "idle",
  confetti: 0,
};

// Async actions
export const fetchSolve = createAsyncThunk(
  "progress/fetchSolve",
  async ({ userId, puzzleId }: { userId: string; puzzleId: number }) => {
    return await backendGetSolve(userId, puzzleId);
  }
);

export const verifyAttempt = createAsyncThunk<
  VerifyAttemptResp,
  { userId: string },
  { state: AppState }
>("progress/verifyAttempt", async ({ userId }, { getState }) => {
  const attempt = getState().progress.attempt;
  if (!attempt) {
    throw Error("No attempt to submit");
  }
  return await backendVerifyAttempt(attempt, userId);
});

// Slice
export const puzzlesSlice = createSlice({
  name: "puzzles",
  initialState: INITIAL_STATE,
  reducers: {
    resetProgress: (state) => {
      state = { ...INITIAL_STATE };
    },
    setAttempt: (state, action: PayloadAction<Attempt>) => {
      state.attempt = action.payload;
    },
    setSolve: (state, action: PayloadAction<Solve>) => {
      state.solve = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      // fetchSolve
      .addCase(fetchSolve.pending, (state) => {
        state.fetchSolveStatus = "loading";
      })
      .addCase(fetchSolve.fulfilled, (state, action) => {
        state.fetchSolveStatus = "success";
        if (action.payload) {
          state.solve = action.payload;
        }
      })
      .addCase(fetchSolve.rejected, (state, action) => {
        state.fetchSolveStatus = "error";
        toast(action.error.message || "", { icon: "🚫" });
      })
      // checkAttempt
      .addCase(verifyAttempt.pending, (state) => {
        state.verifyAttemptStatus = "loading";
      })
      .addCase(verifyAttempt.fulfilled, (state, action) => {
        state.verifyAttemptStatus = "success";
        const resp = action.payload;
        if (resp.correct) {
          state.solve = resp.solve;
          state.confetti = 300;
        }
      })
      .addCase(verifyAttempt.rejected, (state, action) => {
        state.verifyAttemptStatus = "error";
        toast(action.error.message || "", { icon: "🚫" });
      });
  },
});

export const { resetProgress, setAttempt, setSolve } = puzzlesSlice.actions;
export default puzzlesSlice.reducer;
