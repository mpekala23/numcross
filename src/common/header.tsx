import React, { useCallback } from "react";
import {
  QuestionMarkCircleIcon,
  ChartPieIcon,
  WrenchScrewdriverIcon,
  TrophyIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import useModal from "@/hooks/useModal";
import LeaderboardOverlay from "./leaderboard_overlay";
import StatsOverlay from "./stats_overlay";
import SettingsOverlay from "./settings_overlay";
import HelpOverlay from "./help_overlay";
import { useRouter } from "next/router";
import { RWebShare } from "react-web-share";

export default function Header() {
  const [LeaderboardModal, openLeaderboardModal, closeLeaderboardModal] =
    useModal();
  const [HelpModal, openHelpModal, closeHelpModal] = useModal();
  const [StatsModal, openStatsModal, closeStatsModal] = useModal();
  const [SettingsModal, openSettingsModal, closeSettingsModal] = useModal();

  const router = useRouter();

  const goToIndex = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <div className="flex justify-around items-center border-b-2 border-slate-200 p-2">
      <div className="flex justify-between items-center w-full max-w-[550px]">
        <div className="flex pt-2 hover:cursor-pointer" onClick={goToIndex}>
          <img
            src="logo64_black.png"
            className="w-8 h-8 -translate-y-1 mr-[1px]"
          />
          <p className="text-2xl font-bold font-title hover:cursor-pointer">
            UMCROSS
          </p>
        </div>
        <div className="flex">
          <RWebShare
            data={{
              text: "I'm playing NumCross. The fact that you aren't is deeply concerning.",
              url: "https://numcross.com",
              title: "NumCross",
            }}
          >
            <div
              className="p-1 hover:cursor-pointer"
              onClick={openLeaderboardModal}
            >
              <ShareIcon className="w-8 h-8 text-black" />
            </div>
          </RWebShare>
          <div
            className="p-1 hover:cursor-pointer"
            onClick={openLeaderboardModal}
          >
            <TrophyIcon className="w-8 h-8 text-black" />
          </div>
          <div className="p-1 hover:cursor-pointer" onClick={openHelpModal}>
            <QuestionMarkCircleIcon className="w-8 h-8 text-black" />
          </div>
          <div className="p-1 hover:cursor-pointer" onClick={openStatsModal}>
            <ChartPieIcon className="w-8 h-8 text-black" />
          </div>
          <div className="p-1 hover:cursor-pointer" onClick={openSettingsModal}>
            <WrenchScrewdriverIcon className="w-8 h-8 text-black" />
          </div>
        </div>

        <LeaderboardModal>
          <LeaderboardOverlay closeModal={closeLeaderboardModal} />
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
      </div>
    </div>
  );
}
