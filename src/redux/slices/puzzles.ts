import { getTodaysNumcross } from "@/api/backend";
import { LoadingStatus, Numcross } from "@/types/types";
import { getESTDatestring } from "@/utils";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";

// State
export interface PuzzlesState {
  status: LoadingStatus;
  puzzleMap: { [key: string]: Numcross };
}
const INITIAL_STATE: PuzzlesState = {
  status: "idle",
  puzzleMap: {},
};

// Actions
export const refreshTodaysNumcross = createAsyncThunk(
  "puzzles/refreshTodaysNumcross",
  async () => {
    const response = await getTodaysNumcross();
    return response.numcross;
  }
);

// Slice
export const puzzlesSlice = createSlice({
  name: "puzzles",
  initialState: INITIAL_STATE,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(refreshTodaysNumcross.pending, (state) => {
        state.status = "loading";
      })
      .addCase(refreshTodaysNumcross.fulfilled, (state, action) => {
        state.status = "success";
        state.puzzleMap[getESTDatestring()] = action.payload;
      })
      .addCase(refreshTodaysNumcross.rejected, (state, action) => {
        state.status = "error";
        toast(action.error.message || "", { icon: "🚫" });
      });
  },
});

export default puzzlesSlice.reducer;
