import { configureStore } from "@reduxjs/toolkit";
import leaderboardsReducer from "./slices/leaderboards";
import progressReducer from "./slices/progress";
import puzzlesReducer from "./slices/puzzles";
import statsReducer from "./slices/stats";

const store = configureStore({
  reducer: {
    leaderboards: leaderboardsReducer,
    progress: progressReducer,
    puzzles: puzzlesReducer,
    stats: statsReducer,
  },
});

export default store;

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
