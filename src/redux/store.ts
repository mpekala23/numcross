import { configureStore } from "@reduxjs/toolkit";
import puzzlesReducer from "./slices/puzzles";

const store = configureStore({
  reducer: {
    puzzles: puzzlesReducer,
  },
});

export default store;

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
