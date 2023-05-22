import { createContext } from "react";

interface Props {
  leaderboardTrigger: boolean;
  refreshLeaderboards: () => void;
  statsTrigger: boolean;
  refreshStats: () => void;
}

export const HeaderContext = createContext<Props>({
  leaderboardTrigger: false,
  refreshLeaderboards: () => {},
  statsTrigger: false,
  refreshStats: () => {},
});
