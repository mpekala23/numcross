import React, { useCallback, useEffect, useState } from "react";
import useModal from "@/hooks/useModal";
import { ReactElement } from "react";
import HelpOverlay from "./help_overlay";
import LeaderboardOverlay from "./leaderboard_overlay";
import SettingsOverlay from "./settings_overlay";
import StatsOverlay from "./stats_overlay";
import { useUser } from "@supabase/auth-helpers-react";
import { getLeaderboard, getStats, setUsername } from "@/api/backend";
import { LeaderboardStats, UserStats } from "@/types/stats";
import toast from "react-hot-toast";
import useUsername from "@/hooks/useUsername";

interface Provides {
  OverlayManager: () => ReactElement;
  openLeaderboard: () => void;
  closeLeaderboard: () => void;
  openHelp: () => void;
  closeHelp: () => void;
  openStats: () => void;
  closeStats: () => void;
  openSettings: () => void;
  closeSettings: () => void;
}

export default function useOverlayManager(): Provides {
  const [LeaderboardModal, openLeaderboardModal, closeLeaderboardModal] =
    useModal();
  const [HelpModal, openHelpModal, closeHelpModal] = useModal();
  const [StatsModal, openStatsModal, closeStatsModal] = useModal();
  const [SettingsModal, openSettingsModal, closeSettingsModal] = useModal();
  const user = useUser();

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardStats | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState<string>("");
  const { username, setUsername: setUsernameState } = useUsername();
  const refreshLeaderboard = useCallback(async () => {
    try {
      const stats = await getLeaderboard();
      if (!stats) {
        setLeaderboardError("Can't get leaderboard. Try again later.");
        setLeaderboardLoading(false);
        return;
      }
      setLeaderboard(stats);
      setLeaderboardLoading(false);
    } catch (error) {
      setLeaderboardError("Unknown error while getting the leaderboard.");
      setLeaderboardLoading(false);
    }
  }, []);
  useEffect(() => {
    refreshLeaderboard();
  }, [refreshLeaderboard, username]);
  const updateUsername = useCallback(
    async (newUsername: string) => {
      if (!user) return;
      if (newUsername === "framster") {
        toast("Sorry, that's a stupid username.", {
          icon: "🚫",
        });
        return;
      }
      const { data, error } = await setUsername(user.id, newUsername);
      if (data?.status === "ok") {
        setUsernameState(newUsername);
      } else if (error?.message?.includes("duplicate")) {
        toast("Sorry, that username is taken.", { icon: "🚫" });
      } else {
        toast("Something strange went wrong...", { icon: "🚫" });
      }
    },
    [user, setUsernameState]
  );

  // Stats
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string>("");
  const refreshUserStats = useCallback(async () => {
    try {
      if (!user) return;
      const stats = await getStats(user.id);
      if (!stats) {
        setStatsError("No stats found.");
        setStatsLoading(false);
        return;
      }
      setStats(stats);
      setStatsLoading(false);
    } catch (error) {
      setStatsError("Unknown error while getting stats.");
      setStatsLoading(false);
    }
  }, [user]);
  useEffect(() => {
    refreshUserStats();
  }, [refreshUserStats]);

  const OverlayManager = useCallback(() => {
    return (
      <>
        <LeaderboardModal>
          <LeaderboardOverlay
            closeModal={closeLeaderboardModal}
            stats={leaderboard}
            loading={leaderboardLoading}
            error={leaderboardError}
            username={username}
            updateUsername={updateUsername}
          />
        </LeaderboardModal>
        <HelpModal>
          <HelpOverlay closeModal={closeHelpModal} />
        </HelpModal>
        <StatsModal>
          <StatsOverlay
            closeModal={closeStatsModal}
            stats={stats}
            loading={statsLoading}
            error={statsError}
          />
        </StatsModal>
        <SettingsModal>
          <SettingsOverlay closeModal={closeSettingsModal} />
        </SettingsModal>
      </>
    );
  }, [
    HelpModal,
    LeaderboardModal,
    SettingsModal,
    StatsModal,
    closeSettingsModal,
    closeStatsModal,
    closeHelpModal,
    closeLeaderboardModal,
    leaderboard,
    leaderboardError,
    leaderboardLoading,
    stats,
    statsError,
    statsLoading,
    updateUsername,
    username,
  ]);

  return {
    OverlayManager,
    openLeaderboard: openLeaderboardModal,
    closeLeaderboard: closeLeaderboardModal,
    openHelp: openHelpModal,
    closeHelp: closeHelpModal,
    openStats: openStatsModal,
    closeStats: closeStatsModal,
    openSettings: openSettingsModal,
    closeSettings: closeSettingsModal,
  };
}
