import Slink from "@/components/slink";
import { Solve } from "@/types/types";
import { getSolveTime, solveSecondsToString } from "@/utils";
import { useUser } from "@supabase/auth-helpers-react";
import { RWebShare } from "react-web-share";
import React, { useCallback } from "react";
import { ShareIcon } from "@heroicons/react/24/outline";
import Stats from "../../components/stats";

interface Props {
  closeModal: () => void;
  solve: Solve | null;
}

export default function SolvedOverlay({ closeModal, solve }: Props) {
  const user = useUser();

  const renderAccountStats = useCallback(() => {
    return (
      <div className="justify-around pt-4">
        <Stats />
      </div>
    );
  }, []);

  const renderNoAccountPlea = useCallback(() => {
    return (
      <div>
        <p className="text-center">
          Want to save this score and compete on the leaderboard?
        </p>
        <div className="flex justify-center pb-4">
          <Slink href="signup">Sign up</Slink>
        </div>
      </div>
    );
  }, []);

  const solveTime = solve
    ? solveSecondsToString(
        getSolveTime(new Date(solve.startTime), new Date(solve.endTime))
      )
    : "Congrats!";

  return (
    <div className="flex flex-col justify-center align-center">
      <p className="text-3xl font-bold font-title pb-4 text-center">
        {solve ? solveSecondsToString(solve.time) : "Congrats!"}
      </p>
      <p className="text-center font-title text-xl">You solved the puzzle!</p>
      {user ? renderAccountStats() : renderNoAccountPlea()}
      <RWebShare
        data={{
          text:
            "My NumCross time was " + solveTime + ". Think you can beat me?",
          url: "https://numcross.com",
          title: "NumCross",
        }}
      >
        <div className="p-1 hover:cursor-pointer flex justify-center border-2 w-2/3 m-auto">
          <ShareIcon className="w-8 h-8 text-black inline-block" />
          <p className="pl-3 inline-block font-bold text-center pt-1">
            Share Your Time{" "}
          </p>
        </div>
      </RWebShare>
    </div>
  );
}
