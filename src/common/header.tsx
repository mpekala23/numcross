import React, { useCallback } from "react";
import {
  QuestionMarkCircleIcon,
  ChartPieIcon,
  WrenchScrewdriverIcon,
  TrophyIcon,
  ShareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { RWebShare } from "react-web-share";
import useDev from "@/hooks/useDev";
import useOverlayManager from "./overlays/overlay_manager";
import Logo from "../../public/logo64_black.png";
import Image from "next/image";

export default function Header() {
  const router = useRouter();
  const { isDev } = useDev();
  const { OverlayManager, openLeaderboard, openHelp, openStats, openSettings } =
    useOverlayManager();

  const goToIndex = useCallback(() => {
    router.push("/");
  }, [router]);
  return (
    <div className="flex justify-around items-center border-b-2 border-slate-200 p-2">
      <div className="flex justify-between items-center w-full max-w-[550px]">
        <div className="flex pt-2 hover:cursor-pointer" onClick={goToIndex}>
          <Image
            src={Logo}
            className="w-8 h-8 -translate-y-1 mr-[1px]"
            alt="The NumCross logo of a pixelated blackboard bold N"
          />
          <p className="text-2xl font-bold font-title hover:cursor-pointer">
            UMCROSS
          </p>
        </div>
        <div className="flex">
          {isDev && (
            <div
              className="p-1 hover:cursor-pointer"
              onClick={() => {
                // Convenient way to clear the cache when developing locally
                localStorage.clear();
              }}
            >
              <TrashIcon className="w-8 h-8 text-black" />
            </div>
          )}
          <RWebShare
            data={{
              text: "I'm playing NumCross. The fact that you aren't is deeply concerning.",
              url: "https://numcross.com",
              title: "NumCross",
            }}
          >
            <div className="p-1 hover:cursor-pointer">
              <ShareIcon className="w-8 h-8 text-black" />
            </div>
          </RWebShare>
          <div className="p-1 hover:cursor-pointer" onClick={openLeaderboard}>
            <TrophyIcon className="w-8 h-8 text-black" />
          </div>
          <div className="p-1 hover:cursor-pointer" onClick={openHelp}>
            <QuestionMarkCircleIcon className="w-8 h-8 text-black" />
          </div>
          <div
            className="p-1 hover:cursor-pointer"
            onClick={() => {
              openStats();
            }}
          >
            <ChartPieIcon className="w-8 h-8 text-black" />
          </div>
          <div className="p-1 hover:cursor-pointer" onClick={openSettings}>
            <WrenchScrewdriverIcon className="w-8 h-8 text-black" />
          </div>
        </div>
      </div>
      <OverlayManager />
    </div>
  );
}
