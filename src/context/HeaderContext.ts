import {
  LeaderboardStats,
  PrivateLeaderboardStats,
  UserStats,
} from "@/types/stats";
import React, { createContext } from "react";

// We should use redux or make this a lot better
interface Props {
  leaderboardTrigger: boolean;
  refreshLeaderboards: () => void;
  statsTrigger: boolean;
  refreshStats: () => void;
  leaderboard: LeaderboardStats | null;
  privateLeaderboard: PrivateLeaderboardStats | null;
  setLeaderboard: React.Dispatch<React.SetStateAction<LeaderboardStats | null>>;
  setPrivateLeaderboard: React.Dispatch<
    React.SetStateAction<PrivateLeaderboardStats | null>
  >;
  stats: UserStats | null;
  setStats: React.Dispatch<React.SetStateAction<UserStats | null>>;
}

export const HeaderContext = createContext<Props>({
  leaderboardTrigger: false,
  refreshLeaderboards: () => {},
  statsTrigger: false,
  refreshStats: () => {},
  leaderboard: null,
  privateLeaderboard: null,
  setLeaderboard: () => {},
  setPrivateLeaderboard: () => {},
  stats: null,
  setStats: () => {},
});
