import React, { useCallback, useEffect, useState } from "react";
import useModal from "@/hooks/useModal";
import { ReactElement } from "react";
import HelpOverlay from "./help_overlay";
import LeaderboardOverlay from "./leaderboard_overlay";
import SettingsOverlay from "./settings_overlay";
import StatsOverlay from "./stats_overlay";
import { useUser } from "@supabase/auth-helpers-react";
import {
  getLeaderboard,
  getPrivateLeaderboard,
  getStats,
  setUsername,
} from "@/api/backend";
import {
  LeaderboardStats,
  PrivateLeaderboardStats,
  UserStats,
} from "@/types/stats";
import toast from "react-hot-toast";
import useUsername from "@/hooks/useUsername";
import useHeader from "@/hooks/useHeader";

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
  const { leaderboardTrigger, statsTrigger } = useHeader();

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
  }, [refreshLeaderboard, username, leaderboardLoading]);
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

  // My leaderboard
  const [myLeaderboard, setMyLeaderboard] =
    useState<PrivateLeaderboardStats | null>(null);
  const [myLeaderboardLoading, setMyLeaderboardLoading] = useState(true);
  const [myLeaderboardError, setMyLeaderboardError] = useState<string>("");
  const refreshMyLeaderboard = useCallback(async () => {
    if (!user) return;
    try {
      const stats = await getPrivateLeaderboard(user.id);
      if (!stats) {
        setLeaderboardError("Can't get leaderboard. Try again later.");
        setMyLeaderboardLoading(false);
        return;
      }
      setMyLeaderboard(stats);
      setMyLeaderboardLoading(false);
    } catch (error) {
      setMyLeaderboardError("Unknown error while getting the leaderboard.");
      setMyLeaderboardLoading(false);
    }
  }, [user]);
  useEffect(() => {
    refreshMyLeaderboard();
  }, [refreshMyLeaderboard, username, leaderboardTrigger]);

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
  }, [refreshUserStats, statsTrigger]);

  const OverlayManager = useCallback(() => {
    return (
      <>
        <LeaderboardModal>
          <LeaderboardOverlay
            closeModal={closeLeaderboardModal}
            stats={leaderboard}
            myStats={myLeaderboard}
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
    myLeaderboard,
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
