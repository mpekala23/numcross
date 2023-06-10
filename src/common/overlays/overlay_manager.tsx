import React, { useCallback } from "react";
import useModal from "@/hooks/useModal";
import { ReactElement } from "react";
import HelpOverlay from "./help_overlay";
import LeaderboardOverlay from "./leaderboard_overlay";
import SettingsOverlay from "./settings_overlay";
import StatsOverlay from "./stats_overlay";
import { useUser } from "@supabase/auth-helpers-react";
import { backendSetUsername } from "@/api/backend";
import toast from "react-hot-toast";
import useUsername from "@/hooks/useUsername";
import { useAppDispatch } from "@/redux/hooks";
import { refreshPrivateLeaderboard } from "@/redux/slices/leaderboards";

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
  const dispatch = useAppDispatch();

  const { username, setUsername } = useUsername();
  const updateUsername = useCallback(
    async (newUsername: string) => {
      if (!user) return;
      if (newUsername === "framster") {
        toast("Sorry, that's a stupid username.", {
          icon: "🚫",
        });
        return;
      }
      const { data, error } = await backendSetUsername(user.id, newUsername);
      if (data?.status === "ok") {
        setUsername(newUsername);
        dispatch(refreshPrivateLeaderboard({ userId: user.id }));
      } else if (error?.message?.includes("duplicate")) {
        toast("Sorry, that username is taken.", { icon: "🚫" });
      } else {
        toast("Something strange went wrong...", { icon: "🚫" });
      }
    },
    [user, setUsername, dispatch]
  );

  const OverlayManager = useCallback(() => {
    return (
      <>
        <LeaderboardModal>
          <LeaderboardOverlay
            closeModal={closeLeaderboardModal}
            username={username}
            updateUsername={updateUsername}
          />
        </LeaderboardModal>
        <HelpModal>
          <HelpOverlay closeModal={closeHelpModal} />
        </HelpModal>
        <StatsModal>
          <StatsOverlay closeModal={closeStatsModal} />
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
