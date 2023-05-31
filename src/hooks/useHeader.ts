import { HeaderContext } from "@/context/HeaderContext";
import { useContext } from "react";

export default function useHeader() {
  const {
    leaderboardTrigger,
    refreshLeaderboards,
    statsTrigger,
    refreshStats,
    leaderboard,
    setLeaderboard,
    privateLeaderboard,
    setPrivateLeaderboard,
    stats,
    setStats,
  } = useContext(HeaderContext);

  return {
    leaderboardTrigger,
    refreshLeaderboards,
    statsTrigger,
    refreshStats,
    leaderboard,
    setLeaderboard,
    privateLeaderboard,
    setPrivateLeaderboard,
    stats,
    setStats,
  };
}
