import { backendGetTodaysNumcross } from "@/api/backend";
import { LoadingStatus, Numcross } from "@/types/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";

// State
export interface PuzzlesState {
  status: LoadingStatus;
  today: Numcross | null;
  archive: { [key: string]: Numcross };
}
const INITIAL_STATE: PuzzlesState = {
  status: "idle",
  today: null,
  archive: {},
};

// Async actions
export const refreshTodaysNumcross = createAsyncThunk(
  "puzzles/refreshTodaysNumcross",
  async () => {
    const response = await backendGetTodaysNumcross();
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
        state.today = action.payload;
      })
      .addCase(refreshTodaysNumcross.rejected, (state, action) => {
        state.status = "error";
        toast(action.error.message || "", { icon: "🚫" });
      });
  },
});

export default puzzlesSlice.reducer;
