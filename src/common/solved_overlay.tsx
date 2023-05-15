import Slink from "@/components/slink";
import useConfetti from "@/hooks/useConfetti";
import { Solve } from "@/types/types";
import { getSolveTime, solveSecondsToString } from "@/utils";
import { useUser } from "@supabase/auth-helpers-react";
import React, { useCallback, useEffect } from "react";

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

  const renderAccountStats = useCallback(() => {
    return <div />;
  }, []);

  const renderNoAccountPlea = useCallback(() => {
    return (
      <div>
        <p className="text-center">
          Want to save this score and compete on the leaderboard?
        </p>
        <div className="flex justify-center">
          <Slink href="signup">Sign up</Slink>
        </div>
      </div>
    );
  }, []);

  return (
    <div className="flex flex-col justify-center align-center">
      <p className="text-3xl font-bold font-title pb-4 text-center">
        {solve
          ? solveSecondsToString(
              getSolveTime(new Date(solve.startTime), new Date(solve.endTime))
            )
          : "Congrats!"}
      </p>
      <p className="text-center font-title text-xl">You solved the puzzle!</p>
      {user ? renderAccountStats() : renderNoAccountPlea()}
    </div>
  );
}
