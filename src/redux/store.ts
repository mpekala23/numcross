import { configureStore } from "@reduxjs/toolkit";
import progressReducer from "./slices/progress";
import puzzlesReducer from "./slices/puzzles";

const store = configureStore({
  reducer: {
    progress: progressReducer,
    puzzles: puzzlesReducer,
  },
});

export default store;

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
