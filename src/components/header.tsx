import React from "react";
import {
  QuestionMarkCircleIcon,
  ChartPieIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import useModal from "@/hooks/useModal";
import StatsOverlay from "./stats_overlay";

export default function Header() {
  const [StatsModal, openStatsModal, closeStatsModal] = useModal();

  return (
    <div className="flex justify-between items-center border-b-2 border-slate-200 p-2">
      <p className="text-2xl font-bold font-title">NUMCROSS</p>
      <div className="flex">
        <div className="p-1">
          <QuestionMarkCircleIcon className="w-8 h-8 text-black" />
        </div>
        <div className="p-1" onClick={openStatsModal}>
          <ChartPieIcon className="w-8 h-8 text-black" />
        </div>
        <div className="p-1">
          <WrenchScrewdriverIcon className="w-8 h-8 text-black" />
        </div>
      </div>

      <StatsModal>
        <StatsOverlay closeModal={closeStatsModal} />
      </StatsModal>
    </div>
  );
}
