import Slink from "@/components/slink";
import useConfetti from "@/hooks/useConfetti";
import { Solve } from "@/types/types";
import { UserStats } from "@/types/stats";
import { getSolveTime, solveSecondsToString } from "@/utils";
import { useUser } from "@supabase/auth-helpers-react";
import { RWebShare } from "react-web-share";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { ShareIcon } from "@heroicons/react/24/outline";
import { getStats } from "@/api/backend";
import Stats from "../../components/stats";

interface Props {
  closeModal: () => void;
  solve: Solve | null;
}

export default function SolvedOverlay({ closeModal, solve }: Props) {
  const { startConfetti } = useConfetti();
  const user = useUser();

  useEffect(() => {
    startConfetti();
  }, [startConfetti]);

  // DAVID DEVLOG: rendering stats

  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const refreshUserStats = useCallback(async () => {
    if (!user) return;
    const stats = await getStats(user.id);
    setStats(stats);
    setStatsLoading(false);
  }, [user]);

  useEffect(() => {
    refreshUserStats();
  }, [refreshUserStats]);

  const renderAccountStats = useCallback(() => {
    if (statsLoading) {
      return (
        <div className="justify-around pt-4">
          <p>Stats Loading...</p>
        </div>
      );
    }
    return (
      <div className="justify-around pt-4">
        <Stats stats={stats} />
      </div>
    );
  }, [stats, statsLoading]);

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

  const solveTime = useMemo(() => {
    return solve
      ? solveSecondsToString(
          getSolveTime(new Date(solve.startTime), new Date(solve.endTime))
        )
      : "Congrats!";
  }, [solve]);

  // rendering share

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
