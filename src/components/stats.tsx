import React, { useCallback } from "react";
import { asPercentage, solveSecondsToString, streakToString } from "@/utils";
import { useAppSelector } from "@/redux/hooks";
import ReactLoading from "react-loading";

function renderStat({ name, value }: { name: string; value: number | string }) {
  return (
    <div className="flex flex-col justify-center items-center">
      {value && <p className="text-2xl font-title px-4">{value}</p>}
      <p className="text-xs text-center h-8 font-body px-4 text-slate-600">
        {name}
      </p>
    </div>
  );
}

export default function Stats() {
  const { status, userStats } = useAppSelector((state) => state.stats);

  const renderError = useCallback((errorString: string) => {
    return (
      <div className="flex h-16 justify-center items-center">
        <p className="text-md font-body px-4">{errorString}</p>
      </div>
    );
  }, []);

  if (status !== "success") {
    <ReactLoading height={100} width={100} type={"cubes"} color="#111" />;
  }

  if (!userStats) return renderError("No stats found. Are you logged in?");

  return (
    <div>
      <div className="flex justify-around">
        {renderStat({ name: "Played", value: userStats.numPlayed })}
        {renderStat({
          name: "Win %",
          value: asPercentage(userStats.numSolved, userStats.numPlayed),
        })}
        {renderStat({
          name: "Avg. Solve Time",
          value: solveSecondsToString(userStats.averageSolveTime),
        })}
      </div>
      <div className="flex justify-around">
        {renderStat({
          name: "Current Streak",
          value: streakToString(userStats.currentStreak),
        })}
        {renderStat({
          name: "Max Streak",
          value: streakToString(userStats.maxStreak),
        })}
      </div>
    </div>
  );
}
