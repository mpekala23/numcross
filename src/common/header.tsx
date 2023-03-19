import React, { useCallback } from "react";
import {
  QuestionMarkCircleIcon,
  ChartPieIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import useModal from "@/hooks/useModal";
import StatsOverlay from "./stats_overlay";
import SettingsOverlay from "./settings_overlay";
import HelpOverlay from "./help_overlay";
import { useRouter } from "next/router";

export default function Header() {
  const [HelpModal, openHelpModal, closeHelpModal] = useModal();
  const [StatsModal, openStatsModal, closeStatsModal] = useModal();
  const [SettingsModal, openSettingsModal, closeSettingsModal] = useModal();

  const router = useRouter();

  const goToIndex = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <div className="flex justify-between items-center border-b-2 border-slate-200 p-2">
      <p className="text-2xl font-bold font-title" onClick={goToIndex}>
        NUMCROSS
      </p>
      <div className="flex">
        <div className="p-1" onClick={openHelpModal}>
          <QuestionMarkCircleIcon className="w-8 h-8 text-black" />
        </div>
        <div className="p-1" onClick={openStatsModal}>
          <ChartPieIcon className="w-8 h-8 text-black" />
        </div>
        <div className="p-1" onClick={openSettingsModal}>
          <WrenchScrewdriverIcon className="w-8 h-8 text-black" />
        </div>
      </div>

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
  );
}
